// Create a config.js file with the example below

module.exports = {
    enviroment: 'development', // development or production
    name: 'Website', // Site name
    productionFolderName: 'dist', // Folder that will hold all compiled files for production enviroment
    https: false, // true or false
    webpackDevServer: {
        host: process.env.HOST, // Defaults to `localhost`
        port: process.env.PORT, // Defaults to 8080
        open: true // Open the page in browser
    }
};
