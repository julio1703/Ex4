const {dbConnection} = require("../db_connection");

const userController = {
    async registerUser(req, res) {
        const {username, password} = req.body;
        if(!username || !password)
            return res.status(400).json({error: "Invalid username and password"});

        const connection = await dbConnection.createConnection();

        try {
            let [rows] = await connection.execute(`SELECT username FROM tbl_27_users WHERE username = "${username}"`);
            if(rows[0])
                return res.status(400).send({error: "Username Already Exists"});

            [rows] = await connection.execute(`SELECT * FROM tbl_27_users`);
            if(rows.length > 4)
                return res.status(400).send({error: "Reached Maximum Users"});

            const access_token = Math.random().toString(36).substring(2) + Math.random().toString(36).substring(2);

            [rows] = await connection.execute(`INSERT INTO tbl_27_users (username, password, access_token) VALUES("${username}", "${password}", "${access_token}")`);
            if(rows.affectedRows === 0)
                return res.status(500).json({error: "Server error couldn't register user"});

            res.status(201).json({message: "Registration successful", access_token: access_token});
            await connection.end();
        } catch (error) {
            res.status(500).json({error: error.message});
            await connection.end();
        }
    },

    async getUserAccessToken(req, res) {
        const {username, password} = req.body;
        if(!username || !password)
            return res.status(404).json({error: "Invalid username and password"});

        const connection = await dbConnection.createConnection();

        try {
            const [rows] = await connection.execute(`SELECT access_token FROM tbl_27_users WHERE username = '${username}' AND password = '${password}'`);
            if(rows.length === 0)
                return res.status(400).json({error: "Incorrect username or password"});

            res.status(200).json(rows[0]);
            await connection.end();
        } catch (error) {
            res.status(500).json({error: error.message});
            await connection.end();
        }
    }
};

module.exports = { userController };