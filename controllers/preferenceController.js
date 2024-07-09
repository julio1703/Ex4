const {dbConnection} = require("../db_connection");

const preferencesController = {
    async getAllPreferences(req, res) {
        const connection = await dbConnection.createConnection();

        try {
            const [rows] = await connection.execute("SELECT * FROM tbl_27_preferences");
            res.status(200).json(rows);
            await connection.end();
        } catch (error) {
            res.status(500).json({error: error.message});
            await connection.end();
        }
    },

    async getUserPreference(req, res) {
        const connection = await dbConnection.createConnection();

        try {
            const [users] = await connection.execute(`SELECT * FROM tbl_27_users WHERE username = '${req.params.username}'`);
            if(users.length === 0)
                return res.status(404).json({error: "User not found, wrong username"});

            const [rows] = await connection.execute(`SELECT * FROM tbl_27_preferences WHERE user_id = ${users[0].id}`);
            if(rows.length === 0)
                return res.status(404).json({error: `Preferences not found for username ${users[0].username}`});

            res.status(200).json(rows);
            await connection.end();
        } catch (error) {
            res.status(500).json({error: error.message});
            await connection.end();
        }
    }
};

module.exports = { preferencesController };