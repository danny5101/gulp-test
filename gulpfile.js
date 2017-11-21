var gulp = require('gulp');
var del = require('del');
var merge = require('gulp-merge');// 合并多个stream返回一个stream
var htmlmin = require('gulp-htmlmin');
var cleancss = require('gulp-clean-css');
var lesstocss = require('gulp-less');
var uglify = require('gulp-uglify');
var imagemin = require('gulp-imagemin');

var postcss = require('gulp-postcss');
var autoprefixer = require('autoprefixer');
var cssnext = require('cssnext');
var precss = require('precss');

var connect = require('gulp-connect');
var proxy = require('http-proxy-middleware');

// 清除目录文件-test
// gulp.task('clean:deleted', function() {
// 	return del([
// 			'src/deleted/**/*',
// 			'!src/deleted/evaluation.css'
// 		])
// });

// 清除目录文件dist
gulp.task('clean:dist', function() {
	return del(['dist']);
});

// 复制文件
gulp.task('copy:common',  ['clean:dist'], function() {
	return gulp.src('src/common/**/*')
			   .pipe(gulp.dest('dist/src/common'));
});
gulp.task('copy:jslibs', ['clean:dist'], function() {
	return gulp.src(['src/js/jquery-1.8.3.min.js','src/js/test-2.0.1.min.js'])
				.pipe(gulp.dest('dist/src/js'));
});
gulp.task('copy', ['copy:common', 'copy:jslibs']);

// 压缩html
gulp.task('htmlmin', ['clean:dist'], function() {
	var options = {
		removeComments: true,//清除HTML注释
        collapseWhitespace: true,//压缩HTML##!!!慎用，会去除应保留的空格
        collapseBooleanAttributes: true,//省略布尔属性的值 <input checked="true"/> ==> <input />
        removeEmptyAttributes: true,//删除所有空格作属性值 <input id="" /> ==> <input />
        removeScriptTypeAttributes: true,//删除<script>的type="text/javascript"
        removeStyleLinkTypeAttributes: true,//删除<style>和<link>的type="text/css"
        minifyJS: true,//压缩页面JS
        minifyCSS: true//压缩页面CSS
	};
	return gulp.src(['src/html/*.html'])
		 	   .pipe(htmlmin(options))
		 	   .pipe(gulp.dest('dist/src/html'));
});

// less转为css
gulp.task('lesstocss', function() {
	return gulp.src(['src/css/*.less'])
			   .pipe(lesstocss())
			   .pipe(gulp.dest('src/css'));
});

// css处理
gulp.task('css', ['clean:dist', 'lesstocss'], function() {
	var processors = [
		autoprefixer,
		cssnext,
		precss
	];
	var cssSream1 = gulp.src(['src/css/*.css'])
						.pipe(postcss(processors))
						.pipe(cleancss())
						.pipe(gulp.dest('dist/src/css'));
	return cssSream1;
	// 等同于上面的一段，a sample of merging stream
	/*var cssSream1 = gulp.src('src/css/base.css')
						.pipe(postcss(processors))
						.pipe(cleancss())
						.pipe(gulp.dest('dist/src/css'));
	var cssSream2 = gulp.src('src/css/evaluation.css')
						.pipe(postcss(processors))
						.pipe(cleancss())
						.pipe(gulp.dest('dist/src/css'));
	var cssSream3 = gulp.src('src/css/evatest.css')
						.pipe(postcss(processors))
						.pipe(cleancss())
						.pipe(gulp.dest('dist/src/css'));
	return merge(cssSream1, cssSream2, cssSream3);*/
});

// 压缩js
gulp.task('jsmin', ['clean:dist'], function() {
	return gulp.src(['src/js/**/*.js', '!src/js/**/{jquery-1.8.3.min,test-2.0.1.min}.js'])// **匹配src/js下的0个或多个子文件夹
				.pipe(uglify({// 配置文档 https://github.com/mishoo/UglifyJS2#mangle-properties-options
					mangle: true,// 类型：Boolean 默认：true 是否修改变量名
				    compress: true,// 类型：Boolean 默认：true 是否完全压缩
				    /*output: {
				    	comments: true// (default false) -- pass true or "all" to preserve all comments
				    }*/
				}))
				.pipe(gulp.dest('dist/src/js'));
});

// 压缩图片
gulp.task('imagemin', ['clean:dist'], function(){
	return gulp.src(['src/image/*.{jpg,png,gif,ico}'])
				.pipe(imagemin({
					optimizationLevel: 5, //类型：Number  默认：3  取值范围：0-7（优化等级）
			        progressive: true, //类型：Boolean 默认：false 无损压缩jpg图片
			        interlaced: true, //类型：Boolean 默认：false 隔行扫描gif进行渲染
			        multipass: true //类型：Boolean 默认：false 多次优化svg直到完全优化
				}))
				.pipe(gulp.dest('dist/src/image'));
});

// 开启本地服务
gulp.task('connect', function() {
	connect.server({
		root: '.',
		livereload: true,
		middleware: function(connect, opt) {
			return [
				/*function cors(req, res, next) {
                    res.setHeader('Access-Control-Allow-Origin', '*')
                    res.setHeader('Access-Control-Allow-Methods', '*')
                    next()
                }*/
                proxy('/lincombFront', {
                	target: 'http://172.16.105.223:8003',
                	changeOrigin: true
                })
			]
		}
	})
});

// reload
gulp.task('htmlLive', function() {
	gulp.src(['src/html/*.html'])
		.pipe(connect.reload());
});
gulp.task('cssLive', function() {
	gulp.src(['src/css/*.css'])
		.pipe(connect.reload());
});
gulp.task('jsLive', function() {
	gulp.src(['src/js/**/*.js', '!src/js/**/{jquery-1.8.3.min,test-2.0.1.min}.js'])
		.pipe(connect.reload());
});
gulp.task('imageLive', function() {
	gulp.src(['src/image/*.{jpg,png,gif,ico}'])
		.pipe(connect.reload());
});

gulp.task('watch', function() {
	gulp.watch(['src/html/*.html'], ['htmlLive']);
	gulp.watch(['src/css/*.less'], ['lesstocss']);// less实时编译
	gulp.watch(['src/css/*.css'], ['cssLive']);
	gulp.watch(['src/js/**/*.js', '!src/js/**/{jquery-1.8.3.min,test-2.0.1.min}.js'], ['jsLive']);
	gulp.watch(['src/image/*.{jpg,png,gif,ico}'], ['imageLive']);
});

gulp.task('default', ['connect', 'watch']);
gulp.task('minAll', ['copy', 'htmlmin', 'css', 'jsmin', 'imagemin']);
