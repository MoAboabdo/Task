const Users = require('../models/user');
const Notes = require('../models/note');
const NotesType = require('../models/notetype');
const { Op } = require('sequelize');
const paginate = require('express-paginate');
const { validationResult } = require('express-validator');
const { connectedUsers, io } = require('../app');

const NotesController = {
  sendNote: async (req, res) => {
    const { noteName, noteMessage, typeId, users } = req.body;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    if (!noteName || !noteMessage || !typeId || !users) {
      res.status(400).json({ msg: 'Invalid Credentials' });
    }

    try {
      if (users.length > 1) {
        users.forEach(async userId => {
          const user = await Users.findOne({ where: { id: parseInt(userId) } });
          const type = await NotesType.findOne({
            where: { id: parseInt(typeId) },
          });

          if (user && type) {
            const note = await Notes.create({
              title: noteName,
              message: noteMessage,
              NoteTypeId: parseInt(typeId),
              userId: user.id,
              mediaFiles: req.file.path,
            });

            if (note) {
              const index = connectedUsers.findIndex(
                row => parseInt(row.user_id) === parseInt(user.id)
              );
              if (index != -1) {
                // send notification for the online user
                io.to(connectedUsers[index].socketId).emit(
                  `createNote`,
                  `Note of type ${type.name} has been created for user ${user.name}`
                );
              }
            }
          }
        });
      } else {
        // if single user
        const user = await Users.findOne({ where: { id: parseInt(users[0]) } });
        const type = await NotesType.findOne({
          where: { id: parseInt(typeId) },
        });
        if (user && type) {
          const note = await Notes.create({
            title: noteName,
            message: noteMessage,
            NoteTypeId: parseInt(typeId),
            UserId: user.id,
            files: req.file.path,
          });
          if (note) {
            const index = connectedUsers.findIndex(
              row => parseInt(row.user_id) === parseInt(user.id)
            );
            if (index != -1) {
              // send notification for the online user
              io.to(connectedUsers[index].socketId).emit(
                `createNote`,
                `Note of type ${type.name} has been created for user ${user.name}`
              );
            }
          }
        }
      }
      res.status(200).json({ msg: 'Done' });
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  },
  getUsersNotes: async (req, res) => {
    const { userId } = req.params;

    if (!userId) {
      res.status(400).json({ msg: 'User Not Found' });
    }

    try {
      const user = await Users.findOne({ where: { id: parseInt(userId) } });

      if (user) {
        const notes = await Notes.findAll({
          where: {
            userId: parseInt(userId),
            archived: false,
          },
        });

        const index = connectedUsers.findIndex(
          e => parseInt(e.user_id) === parseInt(userId)
        );
        if (index != -1) {
          io.to(connectedUsers[index].socketId).emit(
            'createNote',
            'Note has been created'
          );
        }
        return res.status(200).json({ notes });
      }
      res.status(400).json({ msg: 'Invalid Credentials' });
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  },
  getLastNotesStats: async () => {
    try {
      connectedUsers.map(async (user, index) => {
        const user = await Users.findOne({
          where: { id: parseInt(user.userId) },
        });
        if (user.notifications) {
          const notes = await Notes.findAll({
            where: {
              userId: user.userId,
            },
          });
          io.to(connectedUsers[index].socketId).emit(`dailyNotes`, notes);
        }
      });
    } catch (error) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  },
  NotesLastMonth: async (req, res) => {
    const { types, userId } = req.query;

    if (!userId) res.status(400).json({ msg: 'User Not Found' });

    const condition = types
      ? {
          id: types,
          disable: false,
        }
      : { disable: false };

    types = await NotesType.findAll({
      where: condition,
    });

    const enabledTypes = [];

    types.forEach(type => {
      enabledTypes.push(type.id);
    });

    const lastMonth = new Date();

    lastMonth.setDate(lastMonth.getDate() - 31);

    condition = {
      NoteTypeId: enabledTypes,
      createdAt: {
        [Op.lt]: new Date(),
        [Op.gt]: lastMonth,
      },
      userId: userId,
    };

    try {
      const data = await Notes.findAndCountAll({
        limit: req.query.limit,
        offset: req.skip,
      });

      const itemCount = data.count;
      const pageCount = Math.ceil(data.count / req.query.limit);
      res.send({
        page: paginate.getArrayPages(req)(3, pageCount, req.query.page),
        pageCount,
        itemCount,
        Notes: data.rows,
      });
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  },

  DeleteNote: async (req, res) => {
    const { userId, noteId } = req.params;

    if (!userId || !noteId) {
      res.status(400).json({ msg: 'User or Note note found' });
    }

    try {
      await Notes.update(
        {
          archived: true,
        },
        {
          where: {
            userId: userId,
            id: noteId,
          },
        }
      );

      res.status(200).json({ msg: ' Done ' });
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  },
};

module.exports = NotesController;
