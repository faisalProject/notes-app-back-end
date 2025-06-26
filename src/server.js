// import dotenv
import dotenv from 'dotenv';
dotenv.config();

import Hapi from '@hapi/hapi';

// eslint-disable-next-line import/extensions

// notes
import notes from './api/notes/index.js';
import NotesService from './services/postgres/NotesService.js';
import { NotesValidator } from './validator/notes/index.js';

// users
import users from './api/users/index.js';
import UsersService from './services/postgres/UsersService.js';
import { UsersValidator } from './validator/users/index.js';

import ClientError from './exceptions/ClientError.js';

const init = async () => {
  const notesService = new NotesService();
  const usersService = new UsersService();
  
  const server = Hapi.server({
    port: process.env.PORT,
    host: process.env.HOST,
    routes: {
      cors: {
        origin: ['*'],
      }
    }
  });

  await server.register([
    {
      plugin: notes,
      options: {
        service: notesService,
        validator: NotesValidator,
      },
    },
    {
      plugin: users,
      options: {
        service: usersService,
        validator: UsersValidator
      }
    }
  ]);

  server.ext('onPreResponse', (request, h) => {
    const { response } = request;

    if (response instanceof ClientError) {
      const newResponse = h.response({
        status: 'fail',
        message: response.message
      });

      newResponse.code(response.statusCode);
      return newResponse;
    }

    return h.continue;
  })

  await server.start();
  console.log(`Server berjalan pada ${server.info.uri}`);
};

init();
