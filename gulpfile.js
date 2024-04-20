const gulp = require('gulp');
const { exec } = require('child_process');

// Initialize

function createTables(done) {
  exec('node utils/db.utils/createTables.js', (error, stdout, stderr) => {
    console.log(stdout);
    console.log(stderr);
    done(error);
  });
}

function deployCommands(done) {
    exec('node client/deploy-commands.js', (error, stdout, stderr) => {
      console.log(stdout);
      console.log(stderr);
      done(error);
    });
}

exports.initialize = gulp.task('initialize', gulp.series(createTables, deployCommands));

// Reset

function deleteCommands(done) {
    exec('node delete-commands.js', (error, stdout, stderr) => {
      console.log(stdout);
      console.log(stderr);
      done(error);
    });
}

exports.reset = gulp.task('reset', gulp.series(deleteCommands, deployCommands));
