import { defineFeature, loadFeature } from 'jest-cucumber';
import axios, { AxiosResponse } from 'axios';
const mongoose = require('mongoose');
export async function connectDBForTesting() {
    try {
      const dbUri = "mongodb://localhost:27017";
      const dbName = "test";
      await mongoose.connect(dbUri, {
        dbName,
        autoCreate: true,
      });
    } catch (error) {
      console.log("DB connect error");
    }
}
  
export async function disconnectDBForTesting() {
    try {
      await mongoose.connection.close();
    } catch (error) {
      console.log("DB disconnect error");
    }
}

const User = require('../../../models/User.js');
const feature = loadFeature('tests/features/followers/listFollowersUnit.feature');
const SERVER_URL = 'http://localhost:3001'

defineFeature(feature, test => {
    
    let user: typeof User
    let user1: typeof User

    beforeAll(async () => {
        await connectDBForTesting();
        user1 = new User();
    });
    afterAll(async () => {
        await disconnectDBForTesting();
    });

    test('Pegar lista de seguidores - teste unitário', ({ given, when, then }) => {
        given(/^o usuário com id "(.*)" está armazenado no sistema com a lista de seguidores "(.*)", "(.*)", "(.*)"$/, 
        async (id1, id2, id3, id4) => {
            let user1 = await User.findByIdAndUpdate(
                {_id: id1}, 
                {followers: [id2, id3, id4]}, 
                {new: true}
            )
        });

        when(/^fizer a busca pela lista de seguidores do usuário "(.*)"$/, async (id) => {
            user = await User.findById(id)
        });


        then(/^o sistema retorna um JSON com a lista "(.*)", "(.*)", "(.*)"$/, 
        async (id1, id2, id3) => {
            expect(user.followers).toEqual(expect.arrayContaining([id1, id2, id3]))
        });
    });
})