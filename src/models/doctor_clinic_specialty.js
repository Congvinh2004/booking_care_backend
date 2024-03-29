'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class Doctor_Linic_Specialty extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
        }
    };
    Doctor_Linic_Specialty.init({

        patientId: DataTypes.INTEGER,
        clinidId: DataTypes.INTEGER,
        specialtyId: DataTypes.INTEGER

    }, {
        sequelize,
        modelName: 'Doctor_Linic_Specialty',
    });
    return Doctor_Linic_Specialty;
};