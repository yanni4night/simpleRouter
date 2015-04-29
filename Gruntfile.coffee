module.exports = (grunt)->
    (require 'load-grunt-tasks')(grunt)
    (require 'time-grunt')(grunt)

    grunt.initConfig
        pkg: grunt.file.readJSON('./package.json')
        jshint:
            options:
                jshintrc: '.jshintrc'
            source:
                src: ['src/*.js']
        browserify:
            dist:
                files:
                    'router.js': ['src/*.js']
            test:
                expand: true,
                cwd: 'src',
                src: ['test/*.js'],
                dest: '.'
        uglify:
            dist:
                files:
                    'router.js': 'router.js'
        watch:
            dist:
                files: ['src/{test/,}*.js'],
                tasks: 'default'

    grunt.registerTask 'default', ['jshint', 'browserify', 'uglify']