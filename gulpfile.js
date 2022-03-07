'use strict';

const {series, parallel, src, dest, watch} = require('gulp');
const log = require('fancy-log');
const clean = require('gulp-clean');
const ejs = require('gulp-ejs');
const sass = require('gulp-sass')(require('sass'));
const srcmap = require('gulp-sourcemaps');
const connect = require('gulp-connect');
const deploy = require('gulp-gh-pages');
const rename = require('gulp-rename')


function clean_builds() {
    return src(['./dist/*', './.publish/*'], {read: false, dot: true})
        .pipe(clean({force: true}));
}

function build_html() {
    return src('./src/page/*.ejs')
        .pipe(ejs({}, {}, {ext: '.html'}).on('error', log))
        .pipe(rename({extname: '.html'}))
        .pipe(dest('./dist'))
        .pipe(connect.reload());
}

function build_styles() {
    return src('./src/scss/*.scss')
        .pipe(srcmap.init())
        .pipe(sass().on('error', sass.logError))
        .pipe(srcmap.write('.'))
        .pipe(dest('./dist/css'))
        .pipe(connect.reload());
}

function build_scripts() {
    return src('./src/scripts/**/*')
        .pipe(dest('./dist/scripts/'))
        .pipe(connect.reload());
}

function build_statics() {
    return src('./src/static/**/*', {dot: true})
        .pipe(dest('./dist/'))
        .pipe(connect.reload());
}

function run_server(cb) {
    connect.server({
        port: 8081,
        root: './dist/',
        livereload: true,
    });
    cb();
}

function deploy_gh_pages() {
    return src('./dist/**/*', {dot: true})
        .pipe(deploy({
            origin: 'origin',
            branch: 'gh-pages',
            cacheDir: '.deploy',
        }));
}

watch('./src/page/**/*.ejs', build_html);
watch('./src/scss/*.scss', build_styles);
watch('./src/scripts/**/*', build_scripts);
watch('./src/static/**/*', build_statics);

const build = parallel(
    build_html,
    build_styles,
    build_scripts,
    build_statics
);

const server = series(
    clean_builds,
    build,
    run_server
);

exports.default = server;
exports.clean = clean_builds;
exports.html = build_html;
exports.style = build_styles;
exports.script = build_scripts;
exports.static = build_statics;
exports.build = build;
exports.server = server;
exports.deploy = deploy_gh_pages;
