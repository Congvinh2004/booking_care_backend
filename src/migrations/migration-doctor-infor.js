'use strict';

const { toDefaultValue } = require("sequelize/lib/utils");

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable('doctor_infor', {

            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER
            },

            doctorId: {

                type: Sequelize.INTEGER,
                allowNull: false,
            },

            specialtyId: {
                type: Sequelize.INTEGER,
            },
            clinicId: {
                type: Sequelize.INTEGER,
            },
            priceId: {

                type: Sequelize.STRING,
                allowNull: false,

            },
            provinceId: {

                type: Sequelize.STRING,
                allowNull: false,

            },
            paymentId: {
                allowNull: false,

                type: Sequelize.STRING
            },
            addressClinic: {
                allowNull: false,

                type: Sequelize.STRING
            },
            nameClinic: {
                allowNull: false,

                type: Sequelize.STRING
            },

            note: {

                type: Sequelize.STRING
            },
            count: {
                allowNull: false,
                defaultValue: 0,
                type: Sequelize.INTEGER
            },


            createdAt: {
                allowNull: false,
                type: Sequelize.DATE
            },
            updatedAt: {
                allowNull: false,
                type: Sequelize.DATE
            }
        });
    },
    down: async (queryInterface, Sequelize) => {
        await queryInterface.dropTable('doctor_infor');
    }
};