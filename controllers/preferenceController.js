const {dbConnection} = require("../db_connection");

const preferencesController = {
    async getAllPreferences(req, res) {
        const connection = await dbConnection.createConnection();

        try {
            const [rows] = connection.execute("SELECT * FROM tbl_27_preferences");
            res.status(200).json(rows);
            await connection.end();
        } catch (error) {
            res.status(500).json({error: error.message});
            await connection.end();
        }
    }
};

module.exports = { preferencesController };