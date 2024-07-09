const {dbConnection} = require("../db_connection");
const {vacationDestinations} = require("../data/vacation_destinations.json");
const {vacationTypes} = require("../data/vacation_types.json");

function checkPreference(res, startDate, endDate, vacationDestination, vacationType){
    if(isNaN(Date.parse(startDate)))
        return res.status(400).json({error: "Invalid start date format", format: "YYYY/MM/DD"});

    if(isNaN(Date.parse(endDate)))
        return res.status(400).json({error: "Invalid end date format", format: "YYYY/MM/DD"});

    if(Date.parse(endDate) < Date.parse(startDate))
        return res.status(400).json({error: "Start date can't be after end date"});

    if((Date.parse(endDate) - Date.parse(startDate)) / (1000 * 60 * 60 * 24) > 7)
        return res.status(400).json({error: "The duration of the vacation should be less than a week"});

    if(!vacationDestinations.includes(vacationDestination))
        return res.status(400).json({error: "Invalid vacation destination", "vacation-destination": vacationDestinations});

    if(!vacationTypes.includes(vacationType))
        return res.status(400).json({error: "Invalid vacation type", "vacation-types": vacationTypes});

    return false;
}

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
    },

    async addUserPreference(req, res) {
        const {accessToken, startDate, endDate, vacationDestination, vacationType} = req.body;
        if(!accessToken || !startDate || !endDate || !vacationDestination || !vacationType)
            return res.status(400).json({error: "Provide all required fields (accessToken, startDate, endDate, vacationDestination, vacationType)"});

        if(checkPreference(res, startDate, endDate, vacationDestination, vacationType))
            return;

        const connection = await dbConnection.createConnection();

        try {
            let [rows] = await connection.execute(`SELECT * FROM tbl_27_users WHERE access_token = '${accessToken}'`);
            if(rows.length === 0)
                return res.status(404).json({error: "User not found, incorrect access token"});

            if(rows[0].access_token !== accessToken)
                return res.status(401).json({error: "Invalid access token"});

            const userId = rows[0].id;
            [rows] = await connection.execute(`SELECT * FROM tbl_27_preferences WHERE user_id = ${userId}`);
            if(rows.length > 0)
                return res.status(400).json({error: "User already has a vacation preference"});

            [rows] = await connection.execute(`INSERT INTO tbl_27_preferences (start_date, end_date, destination, vacation_type, user_id) VALUES('${startDate}', '${endDate}', '${vacationDestination}', '${vacationType}', ${userId})`);
            if(rows.affectedRows === 0)
                return res.status(500).json({error: "Server error couldn't add preference"});

            res.status(201).json({message: "Preference added successfully"});
            await connection.end();
        } catch (error) {
            res.status(500).json({error: error.message});
            await connection.end();
        }
    },

    async updateUserPreference(req, res) {
        const {accessToken, startDate, endDate, vacationDestination, vacationType} = req.body;
        if(!accessToken || !startDate || !endDate || !vacationDestination || !vacationType)
            return res.status(400).json({error: "Provide all required fields (accessToken, startDate, endDate, vacationDestination, vacationType)"});

        if(checkPreference(res, startDate, endDate, vacationDestination, vacationType))
            return;

        const connection = await dbConnection.createConnection();

        try {
            let [rows] = await connection.execute(`SELECT * FROM tbl_27_users WHERE access_token = '${accessToken}'`);
            if(rows.length === 0)
                return res.status(404).json({error: "User not found, incorrect access token"});

            if(rows[0].access_token !== accessToken)
                return res.status(401).json({error: "Invalid access token"});

            const userId = rows[0].id;
            [rows] = await connection.execute(`SELECT * FROM tbl_27_preferences WHERE user_id = ${userId}`);
            if(rows.length === 0)
                return res.status(400).json({error: "User doesn't have a vacation preference"});

            [rows] = await connection.execute(`UPDATE tbl_27_preferences SET start_date = '${startDate}', end_date = '${endDate}', destination = '${vacationDestination}', vacation_type = '${vacationType}' WHERE user_id = ${userId}`);
            if(rows.affectedRows === 0)
                return res.status(500).json({error: "Server error couldn't update preference"});

            res.status(200).json({message: "Preference updated successfully"});
            await connection.end();
        } catch (error) {
            res.status(500).json({error: error.message});
            await connection.end();
        }
    },

    async getVacationResult(req, res) {
        const connection = await dbConnection.createConnection();

        try {
            let [rows] = await connection.execute("SELECT * FROM tbl_27_preferences");
            if(rows.length < 5)
                return res.status(404).json({error: "Not all 5 users have added their preferences"});

            [rows] = await connection.execute("SELECT * FROM tbl_27_preferences group by destination order by COUNT(destination) DESC, id ASC LIMIT 1");
            const vacationDestination = rows[0].destination;

            [rows] = await connection.execute("SELECT * FROM tbl_27_preferences group by vacation_type order by COUNT(vacation_type) DESC, id ASC LIMIT 1");
            const vacationType = rows[0].vacation_type;

            [rows] = await connection.execute("SELECT * FROM tbl_27_preferences order by start_date DESC LIMIT 1");
            const startDate = rows[0].start_date;

            [rows] = await connection.execute("SELECT * FROM tbl_27_preferences order by end_date ASC LIMIT 1");
            const endDate = rows[0].end_date;

            const duration = (Date.parse(endDate) - Date.parse(startDate)) / (1000 * 60 * 60 * 24);
            if(duration > 7 || duration < 0)
                return res.status(400).json({error: "There is no suitable vacation date for everyone"});

            res.status(200).json({
                message: "Vacation Result",
                destination: destination,
                "vacation-type": vacationType,
                "start-date": startDate,
                "end-date": endDate
            })
            await connection.end();
        } catch (error) {
            res.status(500).json({error: error.message});
            await connection.end();
        }
    }
};

module.exports = { preferencesController };