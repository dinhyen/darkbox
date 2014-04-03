module.exports = function (grunt) {

  // Project configuration
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    compass: {
      stylesheets: {
        options: {
          sassDir: 'sass',
          cssDir: 'css'
        }
      }
    },

    concat: {
      scripts: {
        options: {
          separator: ';'
        },
        src: 'src/**/*.js',
        dest: 'dist/<%= pkg.name %>.js'
      },
      stylesheets: {
        src: 'css/**/*.css',
        dest: 'dist/<%= pkg.name %>.css'
      }
    },

    cssmin: {
      stylesheets: {
        src: '<%= concat.stylesheets.dest %>',
        dest: 'dist/<%= pkg.name %>.min.css'
      }
    },

    jshint: {
      options: {
        curly: true,
        eqeqeq: true,
        immed: true,
        latedef: true,
        newcap: true,
        noarg: true,
        sub: true,
        undef: true,
        unused: true,
        boss: true,
        eqnull: true,
        node: true
      },
      scripts: {
        src: ['Gruntfile.js', 'src/*.js']
      }
    },

    uglify: {
      options: {
        banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n',
        sourceMap: true
      },
      scripts: {
        src: '<%= concat.scripts.dest %>',
        dest: 'dist/<%= pkg.name %>.min.js'
      }
    },

    watch: {
      stylesheets: {
        files: '**/*.scss',
        tasks: ['compass']
      }
    }
  });

  // Load NPM tasks
  grunt.loadNpmTasks('grunt-contrib-compass');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-watch');

  // Default task(s)
  grunt.registerTask('default', ['jshint', 'compass', 'concat', 'cssmin', 'uglify']);

  grunt.registerTask('watch', ['watch']);
  grunt.registerTask('sassify', ['compass']);

};
