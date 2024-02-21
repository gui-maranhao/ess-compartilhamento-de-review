import { loadFeature, defineFeature } from "jest-cucumber"
import axios, { AxiosResponse } from 'axios'
const mongoose = require('mongoose')
const User = require("../../../models/User")

const feature = loadFeature('tests/features/user/user2.feature');

const SERVER_URL = 'http://localhost:3001'

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

defineFeature(feature, test => {

    beforeAll(async () => {
        await connectDBForTesting();
      });
      afterAll(async () => {
        await disconnectDBForTesting();
      });

    let response: AxiosResponse

    test("Deletar usuário por ID", ({ given, when, then, and }) => {
        given(/^existe um usuário cadastrado com ID "(.*)"$/, async (iduser) => {
            
            const user = await User.findById(iduser)

            if (!user) {
                console.log("Usuário não encontrado")
                return
            }
            
        })
        when(/^uma requisição DELETE foi enviada para "(.*)"$/, async (path) => {
            try {
                response = await axios.delete(`${SERVER_URL}${path}`)
            } catch (error) {
                console.error('Error during HTTP request:', error)
                return
            }
        })
        then(/^o status da resposta é "(.*)"$/, (status) => {
            expect(String(response.status)).toBe(status)
        })
        and(/^o ID "(.*)" não existirá no banco de dados$/, async (iduser) => {
            const user = await User.findById(iduser);
            expect(user).toEqual(null)})
    });
});