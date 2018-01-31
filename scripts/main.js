"use strict";

let gl;

let teapotData;

//let pass_point_light_ubo;

let time = 0;
let pass_matrices_ubb;
//	let pass_matrices_ubo;
	let pass_cam_info_ubb;
	let pass_cam_info_ubo;
	let pass_material_ubb;
	let pass_material_ubo;
	let pass_point_light_ubb;
	let pass_point_light_ubo;
	
	
let pass_mvp_matrix;
let pass_model_matrix;
let pass_view_matrix;
let pass_projection_matrix;
let pass_matrices_ubo;
let cam_move;
let angle = 0;


let pass_vao;


//VARIABLES TO HANDLE MODEL DATA
//VERTICES
let teapot_vertices;
let cloth_vertices;
let table_vertices;
let candle_vertices;
let fire_vertices;
//NORMALS
let teapot_normals;
let cloth_normals;	
let table_normals;
let candle_normals;
let fire_normals;
//TEXCOORDS
let teapot_texcoords;
let cloth_texcoords;
let table_texcoords;
let candle_texcoords;
let fire_texcoords;
//VBO AND INDEX BUFFER
let teapot_vbo_vertices;
let teapot_vbo_normals;
let teapot_vbo_tex;
let teapot_index_buffer;
let cloth_vbo_vertices;
let cloth_vbo_normals;
let cloth_vbo_tex;
let cloth_index_buffer;
let table_vbo_vertices;
let table_vbo_normals;
let table_vbo_tex;
let table_index_buffer;
let candle_vbo_vertices;
let candle_vbo_normals;
let candle_vbo_tex;
let candle_index_buffer;
let fire_vbo_vertices;
let fire_vbo_normals;
let fire_vbo_tex;
let fire_index_buffer;
//INDICES
let teapot_indices;
let cloth_indices;
let table_indices;
let candle_indices;
let fire_indices;
//GPU_ATTRIB_LOCATIONS
let gpu_positions_attrib_location;
let gpu_normals_attrib_location;
let gpu_tex_coord_attrib_location;
//MODEL VAOS
let teapot_vao;
let cloth_vao;
let table_vao;
let candle_vao;
let fire_vao;


// dane dotyczace materialu
    let material_data = new Float32Array([1., 1., 1., 1., 100.]);
	
	let wood_data = new Float32Array([1., 1., 1., 1., 30.]);

	let cloth_texture ;
	let wood_texture ;
    let image ;
	let image2 ;
	
	
    // dane dotyczace swiatla punktowego
    let point_light_data = new Float32Array([
	14.673, 6.5, -9., 10, 1., 0.5, 0.1, 0.0, 
	10., 10., 10., 0, 0., 1., 1., 0.,
	8., 2., 10., 8, 0., 0., 0., 0.,
	2., 5., 8., 0, 1., 1., 1., 0.,
	]);
	
	// dane dotyczace swiatla kierunkowego
    let direct_light_data = new Float32Array([1., 1., 1., 1., 1., 1., 1.]);
	
	// dane dotyczace swiatla otoczenia
    let ambient_light_data = new Float32Array([0.5, 0., 0.]);
	
	//DEFINICJE DLA UBO
	let matrices_ubo
    let cam_info_ubo
    let material_ubo
    let point_light_ubo
	let direct_light_ubo 
	let ambient_light_ubo
	
	//camera position
	let cam_pos;
    // dane o macierzy
    let mvp_matrix;
    let model_matrix;
	let flame_model_matrix;
    let view_matrix;
    let projection_matrix;

	

//VARIABLES FOR MOUSE AND KEYBOARD CONTROL
let z=6.0;
let mouseTracking = -1, startX, startY;
//Camera "look at" position
let positionX = 0.;
let positionY = 0.;
//Angle control for camera rotation
let prevAlpha;
let alpha = 0;
let prevBeta;
let beta = 0;
//Radius control for camera rotation
let radius = 2.;
let prevRadius;
//Camera position
let camX = 1.0;
let camY = 1.0;
let camZ = 1.0;

let scroll_speed = 0.08	;

let multiplier = 0.01; //defines the rotation speed

let step = 1.;

//variables to read model data 
let allText;
let Model;


//shader data
 let vertex_shader  ;
 let fragment_shader ;
 let flame_fragment_shader;
 let teapot_fragment_shader;
 let program ;
 let flame_program ;
 let teapot_program ;

window.addEventListener('keydown', function (event)
{
    if (event.keyCode === 87 || event.keyCode === 38) // W, Up
        positionY += step;
    else if (event.keyCode === 65 || event.keyCode === 37) // A, Left
        positionX -= step;
    else if (event.keyCode === 83 || event.keyCode === 40) // S, Down
        positionY -= step;
    else if (event.keyCode === 68 || event.keyCode === 39) // D, Right
        positionX += step;
});

function handleMouseDown(event) {
    if (event.button == 0) // left button
        mouseTracking = 0;
    else if (event.button == 1)
        mouseTracking = 1;
    startX = event.clientX;
    startY = event.clientY;
    prevAlpha = alpha;
    prevBeta = beta;
    prevRadius = radius;
}

function handleMouseUp(event) {
    mouseTracking = -1;
}

function handleMouseDown(event) {
    if (event.button == 0) // left button
        mouseTracking = 0;
    else if (event.button == 1)
        mouseTracking = 1;
    startX = event.clientX;
    startY = event.clientY;
    prevAlpha = alpha;
    prevBeta = beta;
    prevRadius = radius;
}

function handleMouseMove(event) {

    if (mouseTracking == -1) {
        return;
    }
    let xx = event.clientX;
    let yy = event.clientY;
    let deltaX = -xx + startX;
    let deltaY = yy - startY;
    if (mouseTracking == 0) {
        alpha = prevAlpha + deltaX * 0.01;
        beta = prevBeta + deltaY * 0.01;
        if (beta > 1.5)
            beta = 1.5;
        if (beta < -1.5)
            beta = -1.5;
    }
    else if (mouseTracking == 1) {
        radius = prevRadius - deltaY*0.01;
    }
    spherical2Cartesian();

}
    
function handleMouseWheel(event){
        let delta = 0;
        if (!event) /* For IE. */
            event = window.event;
        if (event.wheelDelta) { /* IE/Opera. */
            delta = event.wheelDelta/120;
        } else if (event.detail) { /** Mozilla case. */
            /** In Mozilla, sign of delta is different than in IE.
             * Also, delta is multiple of 3.
             */
            delta = -event.detail/3;
        }
        /** If delta is nonzero, handle it.
         * Basically, delta is now positive if wheel was scrolled up,
         * and negative, if wheel was scrolled down.
         */
        if (delta)
            handleScroll(delta);
        /** Prevent default actions caused by mouse wheel.
         * That might be ugly, but we handle scrolls somehow
         * anyway, so don?t bother here..
         */
        if (event.preventDefault)
            event.preventDefault();
        event.returnValue = false;
 
    }
 
function handleScroll(delta){
        if (delta < 0){
            scroll_speed = 0.05*z;
			z=z+scroll_speed;
			if( z < 0.5 )
				z = 0.5;
		}
        else{
            scroll_speed = 0.05*z;
			z=z-scroll_speed;
		}
    }

function spherical2Cartesian() {

    camX = radius * Math.cos(beta) * Math.sin(alpha);
    camZ = radius * Math.cos(beta) * Math.cos(alpha);
    camY = radius * Math.sin(beta)
}




function readTextFile(file)
{
    var rawFile = new XMLHttpRequest();
    rawFile.open("GET", file, false);
    rawFile.onreadystatechange = function ()
    {
        if(rawFile.readyState === 4)
        {
            if(rawFile.status === 200 || rawFile.status == 0)
            {
                allText = rawFile.responseText;
                
            }
        }
    }
    rawFile.send(null);
}


function Float32Concat(first, second)
{
    let first_length = first.length,
        result = new Float32Array(first_length + second.length);
    result.set(first);
    result.set(second, first_length);
    return result;
}






function init_webgl()
{
	let m = mat4.create();
    // inicjalizacja webg2
    try {
        let canvas = document.querySelector("#glcanvas");
        gl = canvas.getContext("webgl2");
		canvas.onmousedown = handleMouseDown;
		document.onmouseup = handleMouseUp;
		document.onmousemove = handleMouseMove;
		canvas.addEventListener('DOMMouseScroll',handleMouseWheel, false);
        canvas.addEventListener('mousewheel',handleMouseWheel, false);	
		//gl.enable(gl.CULL_FACE);
		gl.cullFace(gl.BACK);
		gl.enable(gl.DEPTH_TEST);
		gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
		gl.clearColor(0.0, 0.0, 0.0, 1.0);	 
    }
    catch(e) {
    }

    if (!gl)
    {
        alert("Unable to initialize WebGL.");
        return;
    }
	
}

function define_model_data()
{
	//teapot_vertices = new Float32Array( Teapot.vertices );	
	//cloth_vertices = new Float32Array( Cloth.vertices );
	

  
	//teapot_normals = new Float32Array( Teapot.vertexNormals );	
	//cloth_normals = new Float32Array( Cloth.vertexNormals );	


	//teapot_texcoords = new Float32Array( Teapot.textures );
	//cloth_texcoords = new Float32Array( Cloth.textures );
	
	cloth_vbo_vertices = gl.createBuffer();
	cloth_vbo_normals = gl.createBuffer();
	cloth_vbo_tex = gl.createBuffer();
	
	teapot_vbo_vertices = gl.createBuffer();
	teapot_vbo_normals = gl.createBuffer();
	teapot_vbo_tex = gl.createBuffer();
	
	table_vbo_vertices = gl.createBuffer();
	table_vbo_normals = gl.createBuffer();
	table_vbo_tex = gl.createBuffer();
	
	candle_vbo_vertices = gl.createBuffer();
	candle_vbo_normals = gl.createBuffer();
	candle_vbo_tex = gl.createBuffer();
	
	fire_vbo_vertices = gl.createBuffer();
	fire_vbo_normals = gl.createBuffer();
	fire_vbo_tex = gl.createBuffer();
	
	//teapot_indices = new Uint16Array( Teapot.indices );
	
	//cloth_indices = new Uint16Array( Cloth.indices );
	
	cloth_index_buffer = gl.createBuffer();
	teapot_index_buffer = gl.createBuffer();
	table_index_buffer = gl.createBuffer();
	candle_index_buffer = gl.createBuffer();
	fire_index_buffer = gl.createBuffer();
	
    gpu_positions_attrib_location = 0; // musi być taka sama jak po stronie GPU!!!
    gpu_normals_attrib_location = 1;
    gpu_tex_coord_attrib_location = 2;
	
	teapot_vao = gl.createVertexArray();
	cloth_vao = gl.createVertexArray();
	table_vao = gl.createVertexArray();
	candle_vao = gl.createVertexArray();
	fire_vao = gl.createVertexArray();
	
	

}

function Set_Model_Data( vbo_vertices, vertices, vbo_normals, normals, vbo_texcoords, texcoords, index_buffer, indices,	vao )
{
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo_vertices);
    gl.bufferData(gl.ARRAY_BUFFER, vertices	, gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo_normals);
    gl.bufferData(gl.ARRAY_BUFFER, normals	, gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo_texcoords);
    gl.bufferData(gl.ARRAY_BUFFER, texcoords, gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
	
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, index_buffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
   
    gl.bindVertexArray(vao);
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo_vertices);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, index_buffer);
    gl.enableVertexAttribArray(gpu_positions_attrib_location);
    gl.vertexAttribPointer(gpu_positions_attrib_location, 3, gl.FLOAT, gl.FALSE, 0, 0);
	gl.bindBuffer(gl.ARRAY_BUFFER, vbo_normals)
    gl.enableVertexAttribArray(gpu_normals_attrib_location);
    gl.vertexAttribPointer(gpu_normals_attrib_location, 3, gl.FLOAT, gl.FALSE, 0, 0);
	gl.bindBuffer(gl.ARRAY_BUFFER, vbo_texcoords)
    gl.enableVertexAttribArray(gpu_tex_coord_attrib_location);
    gl.vertexAttribPointer(gpu_tex_coord_attrib_location, 2, gl.FLOAT, gl.FALSE, 0, 0);
    gl.bindVertexArray(null);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
}

function attach_model_data()
{
	readTextFile('models/teapot.obj');
	Model = new OBJ.Mesh( allText );
		
	teapot_vertices = new Float32Array( Model.vertices );
	teapot_normals = new Float32Array( Model.vertexNormals );	
	teapot_texcoords = new Float32Array( Model.textures );
	teapot_indices = new Uint16Array( Model.indices );
		
	readTextFile('models/cloth.obj');
	Model = new OBJ.Mesh( allText );
	
	cloth_vertices = new Float32Array( Model.vertices );
	cloth_normals = new Float32Array( Model.vertexNormals );	
	cloth_texcoords = new Float32Array( Model.textures );
	cloth_indices = new Uint16Array( Model.indices );
		console.log(cloth_indices);
	readTextFile('models/table.obj');
	Model = new OBJ.Mesh( allText );
		 
	table_vertices = new Float32Array( Model.vertices );
	table_normals = new Float32Array( Model.vertexNormals );	
	table_texcoords = new Float32Array( Model.textures );
	table_indices = new Uint16Array( Model.indices );
	
	readTextFile('models/candle.obj');
	Model = new OBJ.Mesh( allText );
		 
	candle_vertices = new Float32Array( Model.vertices );
	candle_normals = new Float32Array( Model.vertexNormals );	
	candle_texcoords = new Float32Array( Model.textures );
	candle_indices = new Uint16Array( Model.indices );

	readTextFile('models/flame.obj');
	Model = new OBJ.Mesh( allText );
		 
	fire_vertices = new Float32Array( Model.vertices );
	fire_normals = new Float32Array( Model.vertexNormals );	
	fire_texcoords = new Float32Array( Model.textures );
	fire_indices = new Uint16Array( Model.indices );
}

function init()
{
    init_webgl();
	
	define_model_data();
		
	attach_model_data();	 
		 
	Set_Model_Data ( teapot_vbo_vertices ,  teapot_vertices , teapot_vbo_normals , teapot_normals , teapot_vbo_tex , teapot_texcoords, teapot_index_buffer , teapot_indices , teapot_vao );
		
	Set_Model_Data ( cloth_vbo_vertices ,  cloth_vertices , cloth_vbo_normals , cloth_normals , cloth_vbo_tex , cloth_texcoords, cloth_index_buffer , cloth_indices , 	cloth_vao	 );
		 
	Set_Model_Data ( table_vbo_vertices ,  table_vertices , table_vbo_normals , table_normals , table_vbo_tex , table_texcoords, table_index_buffer , table_indices , 	table_vao	 );
	
	Set_Model_Data ( candle_vbo_vertices ,  candle_vertices , candle_vbo_normals , candle_normals , candle_vbo_tex , candle_texcoords, candle_index_buffer , candle_indices , 	candle_vao	 );
	
	Set_Model_Data ( fire_vbo_vertices ,  fire_vertices , fire_vbo_normals , fire_normals , fire_vbo_tex , fire_texcoords, fire_index_buffer , fire_indices , 	fire_vao	 );
	
    // kompilacja shader-ow
    vertex_shader = createShader(gl, gl.VERTEX_SHADER, vs_source);
    fragment_shader = createShader(gl, gl.FRAGMENT_SHADER, fs_source);
	flame_fragment_shader = createShader(gl, gl.FRAGMENT_SHADER, flame_fs_source);
	teapot_fragment_shader = createShader(gl, gl.FRAGMENT_SHADER, teapot_fs_source);
    program = createProgram(gl, vertex_shader, fragment_shader);
	flame_program = createProgram(gl, vertex_shader, flame_fragment_shader);
	teapot_program = createProgram(gl, vertex_shader, teapot_fragment_shader);

    // pobranie ubi
    let matrices_ubi = gl.getUniformBlockIndex(program, "Matrices");
    let cam_info_ubi = gl.getUniformBlockIndex(program, "CamInfo");
    let material_ubi = gl.getUniformBlockIndex(program, "Material");
    let point_light_ubi = gl.getUniformBlockIndex(program, "PointLight");
	let direct_light_ubi = gl.getUniformBlockIndex(program, "DirectLight");
	let ambient_light_ubi = gl.getUniformBlockIndex(program, "AmbientLight");
	let checker_ubi = gl.getUniformBlockIndex(teapot_program, "CheckerColor");

    // przyporzadkowanie ubi do ubb
    let matrices_ubb = 0;
    gl.uniformBlockBinding(program, matrices_ubi, matrices_ubb);
    let cam_info_ubb = 1;
    gl.uniformBlockBinding(program, cam_info_ubi, cam_info_ubb);

    gl.uniformBlockBinding(teapot_program, cam_info_ubi, cam_info_ubb);
    let material_ubb = 2;
    gl.uniformBlockBinding(program, material_ubi, material_ubb);
    let point_light_ubb = 3;
	
    gl.uniformBlockBinding(program, point_light_ubi, point_light_ubb);
	//gl.uniformBlockBinding(teapot_program, point_light_ubi, point_light_ubb);
	
	let direct_light_ubb = 4;
    gl.uniformBlockBinding(program, direct_light_ubi, direct_light_ubb);
	let ambient_light_ubb = 5;
    gl.uniformBlockBinding(program, ambient_light_ubi, ambient_light_ubb);
	let checker_ubb = 6;
    gl.uniformBlockBinding(teapot_program, checker_ubi, checker_ubb);

    // tworzenie sampler-a
    let linear_sampler = gl.createSampler();
    // Ustawienie parametrów sampler-a
    gl.samplerParameteri(linear_sampler, gl.TEXTURE_WRAP_S, gl.REPEAT);
    gl.samplerParameteri(linear_sampler, gl.TEXTURE_WRAP_T, gl.REPEAT);
    gl.samplerParameteri(linear_sampler, gl.TEXTURE_WRAP_R, gl.REPEAT);
    gl.samplerParameteri(linear_sampler, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
    gl.samplerParameteri(linear_sampler, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    
    // tworzenie teksutry
    cloth_texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, cloth_texture);
    // wypelnianie tekstury jednym pikselem
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array(255, 255, 255, 255));
    gl.bindTexture(gl.TEXTURE_2D, null);
    // ładowanie obrazka (asynchronicznie)
    image = new Image();
    image.src = "images/cloth_texture.png";
    image.addEventListener('load', function(){
        gl.bindTexture(gl.TEXTURE_2D, cloth_texture);
        // ladowanie danych z obrazka do tekstury
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
        // tworzenie mipmap
        gl.generateMipmap(gl.TEXTURE_2D);
    });	
	
    wood_texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, wood_texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array(255, 255, 255, 255));
    gl.bindTexture(gl.TEXTURE_2D, null);
	image2 = new Image();
    image2.src = "images/wildtextures-dark-wood-board.jpg";
    image2.addEventListener('load', function(){
        gl.bindTexture(gl.TEXTURE_2D, wood_texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image2);
        gl.generateMipmap(gl.TEXTURE_2D);
    });	

    // pozycja kamery
    cam_pos = new Float32Array([camX, camY, camZ]);

    // dane o macierzy
    mvp_matrix = mat4.create();
    model_matrix = mat4.create();
	flame_model_matrix = mat4.create();
    //mat4.rotateX(model_matrix, model_matrix, 3*Math.PI/2);
    view_matrix = mat4.create();
    mat4.lookAt(view_matrix, cam_pos, new Float32Array([0., 0., 0.]), new Float32Array([0., 1., 0.]));
    //mat4.lookAt(view_matrix, new Float32Array([0., -2., 2.]), new Float32Array([0., 0., 0.]), new Float32Array([0., 0., 1.]));
    projection_matrix = mat4.create();
    mat4.perspective(projection_matrix, Math.PI/4., gl.drawingBufferWidth/gl.drawingBufferHeight, 0.01, 10);
    mat4.multiply(mvp_matrix, projection_matrix, view_matrix);
    mat4.multiply(mvp_matrix, mvp_matrix, model_matrix);

    var checker_color = new Float32Array([1.0, 1.0, 1.0, 0.0, 0.0, 0.0, 0.0, 0.0]);

    // tworzenie UBO
    matrices_ubo = gl.createBuffer();
    gl.bindBuffer(gl.UNIFORM_BUFFER, matrices_ubo);
    gl.bufferData(gl.UNIFORM_BUFFER, Float32Concat(mvp_matrix, model_matrix), gl.DYNAMIC_DRAW);
    gl.bindBuffer(gl.UNIFORM_BUFFER, null);
    cam_info_ubo = gl.createBuffer();
    gl.bindBuffer(gl.UNIFORM_BUFFER, cam_info_ubo);
    gl.bufferData(gl.UNIFORM_BUFFER, cam_pos, gl.DYNAMIC_DRAW);
    gl.bindBuffer(gl.UNIFORM_BUFFER, null);
    material_ubo = gl.createBuffer();
    
    point_light_ubo = gl.createBuffer();
    
	direct_light_ubo = gl.createBuffer();
    gl.bindBuffer(gl.UNIFORM_BUFFER, direct_light_ubo);
    gl.bufferData(gl.UNIFORM_BUFFER, direct_light_data, gl.DYNAMIC_DRAW);
    gl.bindBuffer(gl.UNIFORM_BUFFER, null);
	ambient_light_ubo = gl.createBuffer();
    gl.bindBuffer(gl.UNIFORM_BUFFER, ambient_light_ubo);
    gl.bufferData(gl.UNIFORM_BUFFER, ambient_light_data, gl.DYNAMIC_DRAW);
    gl.bindBuffer(gl.UNIFORM_BUFFER, null);
	var checker_ubo = gl.createBuffer();
    gl.bindBuffer(gl.UNIFORM_BUFFER, checker_ubo);
    gl.bufferData(gl.UNIFORM_BUFFER, point_light_data, gl.DYNAMIC_DRAW);
    gl.bindBuffer(gl.UNIFORM_BUFFER, null);

    // ustawienia danych dla funkcji draw*
    //gl.useProgram(program);
    gl.bindSampler(0, linear_sampler);
    gl.activeTexture(gl.TEXTURE0 +  0);
    //gl.bindTexture(gl.TEXTURE_2D, cloth_texture);
    //gl.bindVertexArray(cloth_vao);
    gl.bindBufferBase(gl.UNIFORM_BUFFER, matrices_ubb, matrices_ubo);
    gl.bindBufferBase(gl.UNIFORM_BUFFER, cam_info_ubb, cam_info_ubo);
    gl.bindBufferBase(gl.UNIFORM_BUFFER, material_ubb, material_ubo);
    gl.bindBufferBase(gl.UNIFORM_BUFFER, point_light_ubb, point_light_ubo);
	gl.bindBufferBase(gl.UNIFORM_BUFFER, direct_light_ubb, direct_light_ubo);
	gl.bindBufferBase(gl.UNIFORM_BUFFER, ambient_light_ubb, ambient_light_ubo);
	gl.bindBufferBase(gl.UNIFORM_BUFFER, checker_ubb, checker_ubo);
}


function camera_control()
{
	cam_move = Math.sin(angle) + 2;
	angle = angle + 0.01;		
	let new_cam_pos = new Float32Array([camX*z , camY*z , camZ*z ]);
    mat4.lookAt(view_matrix, new_cam_pos, new Float32Array([positionX, positionY, 0.]), new Float32Array([0., 1., 0.]));	
	mat4.perspective(projection_matrix, Math.PI/4., gl.drawingBufferWidth/gl.drawingBufferHeight, 0.01, 200);
    mat4.multiply(mvp_matrix, projection_matrix, view_matrix);
    mat4.multiply(mvp_matrix, mvp_matrix, model_matrix);

	gl.bindBuffer(gl.UNIFORM_BUFFER, matrices_ubo);
	gl.bufferSubData(gl.UNIFORM_BUFFER, 0, mvp_matrix, 0, length);
	gl.bindBuffer(gl.UNIFORM_BUFFER, null);


    gl.bindBuffer(gl.UNIFORM_BUFFER, cam_info_ubo);
    gl.bufferData(gl.UNIFORM_BUFFER, new_cam_pos, gl.DYNAMIC_DRAW);
    gl.bindBuffer(gl.UNIFORM_BUFFER, null);
	
	gl.bindBufferBase(gl.UNIFORM_BUFFER, 1, cam_info_ubo);
}

let flame_alpha = 0.1;
let flame_range;
let range_alpha = 0;

function draw()
{
    // wyczyszczenie ekranu
    gl.clear(gl.COLOR_BUFFER_BIT);
	
	range_alpha += 0.1;
	flame_range = 5.*(Math.sin(range_alpha)+2);
	
	point_light_data = new Float32Array([
	14.673, 6.5, -9., flame_range, 1., 0.5, 0.1, 0.0, 
	10., 10., 10., 0, 0., 1., 1., 0.,
	8., 2., 10., 8, 0., 0., 0., 0.,
	2., 5., 8., 0, 1., 1., 1., 0.,
	]);
	
	gl.bindBuffer(gl.UNIFORM_BUFFER, material_ubo);
    gl.bufferData(gl.UNIFORM_BUFFER, material_data, gl.DYNAMIC_DRAW);
    gl.bindBuffer(gl.UNIFORM_BUFFER, null);
	gl.bindBuffer(gl.UNIFORM_BUFFER, point_light_ubo);
    gl.bufferData(gl.UNIFORM_BUFFER, point_light_data, gl.DYNAMIC_DRAW);
    gl.bindBuffer(gl.UNIFORM_BUFFER, null);
	
	camera_control();
	
	gl.useProgram(program);
	
	gl.bindTexture(gl.TEXTURE_2D, cloth_texture);
	
	gl.bindVertexArray(cloth_vao);
	
    gl.drawElements(gl.TRIANGLES, 20064 , gl.UNSIGNED_SHORT, 0);
	//65535
	
	
	gl.bindTexture(gl.TEXTURE_2D, wood_texture);
	gl.bindBuffer(gl.UNIFORM_BUFFER, material_ubo);
    gl.bufferData(gl.UNIFORM_BUFFER, wood_data, gl.DYNAMIC_DRAW);
    gl.bindBuffer(gl.UNIFORM_BUFFER, null);
	
	gl.bindVertexArray(table_vao);

	gl.drawElements(gl.TRIANGLES, 8832 , gl.UNSIGNED_SHORT, 0);
		
	gl.bindVertexArray(candle_vao);

	gl.drawElements(gl.TRIANGLES, 2880 , gl.UNSIGNED_SHORT, 0);
	
	gl.useProgram(teapot_program);
	
	gl.bindVertexArray(teapot_vao);

	gl.drawElements(gl.TRIANGLES, 2976 , gl.UNSIGNED_SHORT, 0);
	
	gl.useProgram(flame_program);

	mat4.translate(flame_model_matrix, flame_model_matrix, [ 14.673, 6.5, -9. ]);
	mat4.rotateY(flame_model_matrix, flame_model_matrix, flame_alpha);
	mat4.scale(flame_model_matrix, flame_model_matrix, [0.01*Math.sin(range_alpha)+1., 0.02*Math.sin(range_alpha)+1., 0.01*Math.cos(range_alpha)+1.]);
	mat4.translate(flame_model_matrix, flame_model_matrix, [ -14.673, -6.5, 9. ]);
	mat4.multiply(mvp_matrix, projection_matrix, view_matrix);
    mat4.multiply(mvp_matrix, mvp_matrix, flame_model_matrix);
	gl.bindBuffer(gl.UNIFORM_BUFFER, matrices_ubo);
    gl.bufferData(gl.UNIFORM_BUFFER, Float32Concat(mvp_matrix, flame_model_matrix), gl.DYNAMIC_DRAW);
    gl.bindBuffer(gl.UNIFORM_BUFFER, null);
	
	gl.bindVertexArray(fire_vao);

	gl.drawElements(gl.TRIANGLES, 240 , gl.UNSIGNED_SHORT, 0);

	gl.bindBuffer(gl.UNIFORM_BUFFER, matrices_ubo);
    gl.bufferData(gl.UNIFORM_BUFFER, Float32Concat(mvp_matrix, model_matrix), gl.DYNAMIC_DRAW);
    gl.bindBuffer(gl.UNIFORM_BUFFER, null);
	
	
	
    window.requestAnimationFrame(draw);
	
}

function main()
{
     init();
     draw();
	//readTextFile("file:///D:/Magisterskie UJ/Semestr I/Programowanie Grafiki/Z10/models/czajniczek.txt");
	
	
};

function createShader(gl, type, source)
{
    let shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    let success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
    if(success)
    {
        return shader;
    }

    console.log(gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
}

function createProgram(gl, vertex_shader, fragment_shader)
{
    let program = gl.createProgram();
    gl.attachShader(program, vertex_shader);
    gl.attachShader(program, fragment_shader);
    gl.linkProgram(program);
    let success = gl.getProgramParameter(program, gl.LINK_STATUS);
    if(success)
    {
        return program;
    }

    console.log(gl.getProgramInfoLog(program));
    gl.deleteProgram(program);
}

// vertex shader (GLSL)
let vs_source = "#version 300 es\n" +
    // "location" musi byc takie same jak po stronie CPU!!!
    "layout(location = 0) in vec3 vertex_position;\n" +
    "layout(location = 1) in vec3 vertex_normal;\n" +
    "layout(location = 2) in vec2 vertex_tex_coord;\n" +
    "out vec3 position_ws;\n" +
    "out vec3 normal_ws;\n" +
    "out vec2 tex_coord;\n" +

    "layout(std140) uniform Matrices\n" +
    "{\n" +
        "mat4 mvp_matrix;\n" +
        "mat4 model_matrix;\n" +
    "} matrices;\n" +
    "void main()\n" +
    "{\n" +
        "gl_Position = matrices.mvp_matrix*vec4(vertex_position, 1.f);\n" +
        "vec4 tmp_position_ws = matrices.model_matrix*vec4(vertex_position, 1.f);\n" +
        "position_ws = tmp_position_ws.xyz/tmp_position_ws.w;\n" +
        "normal_ws = transpose(inverse(mat3x3(matrices.model_matrix)))*vertex_normal;\n" +
		//"normal_ws = mat3x3(matrices.model_matrix)*vertex_normal;\n" +
        "tex_coord = vertex_tex_coord;\n" +
    "}\n";

// fragment shader (GLSL)
let fs_source = "#version 300 es\n" +
    // fs nie ma domyślnej precyzji dla liczb zmiennoprzecinkowych więc musimy wybrać ją sami
    "precision mediump float;\n" +
    "in vec3 position_ws;\n" +
    "in vec3 normal_ws;\n" +
    "in vec2 tex_coord;\n" +
    "out vec4 vFragColor;\n" +
	
	//Deklaracja struktury swiatel
	"struct PLD\n" +
	"{\n" +
	"	vec3 position_ws;\n" +
	"	float r;\n" +
	"	vec3 color;\n" +
	"}PLD_Lights;\n" +
	"\n" +

    "uniform sampler2D color_tex;\n" +

	
    "layout(std140) uniform CamInfo\n" +
    "{\n" +
       "vec3 cam_pos_ws;\n" +
    "} additional_data;\n" +

    "layout(std140) uniform Material\n" +
    "{\n" +
       "vec3 color;\n" +
       "float specular_intensity;\n" +
       "float specular_power;\n" +
    "} material;\n" +

    "layout(std140) uniform PointLight\n" +
    "{\n" +
       "PLD lights[4];\n" +
    "} point_light;\n" +
	
	"layout(std140) uniform DirectLight\n" +
    "{\n" +
       "vec3 direction_ws;\n" +
       "float intensity;\n" +
       "vec3 color;\n" +
    "} direct_light;\n" +
	
	"layout(std140) uniform AmbientLight\n" +
    "{\n" +
       "vec3 color;\n" +
    "} ambient_light;\n" +

    "void main()\n" +
    "{\n" +		
       "vec3 result;\n" +
	   
	   "vec3 spec;\n" +
	   
	   "vec3 diffuse;\n" +
	   
	   "vec3 directional_spec;\n" +
	   
	   "vec3 light_ray ;\n" +
	   
	   "vec3 direct_light_ray ;\n" +
	   
	   "vec3 view_direction ;\n" +
	   
	   "vec3 reflection_vec;\n" +
	   
	   "vec3 R ;\n" +
	   
	   "vec3 DR ;\n" +
	   
	   "vec3 L;\n" +
	   
	   "int i = 0;\n" +
	   
	   "float nol;\n" +
	   
	   "float aten;\n" +
	   
	   //"float dis_to_light = length(light_ray) ;\n" +
	   "vec3 N = normalize( normal_ws );\n" + 
	   
	   "view_direction = additional_data.cam_pos_ws - position_ws ;\n" +
	   
	   "vec3 V = normalize( view_direction ) ;\n" +
	   
		"vec3 tex = texture(color_tex, tex_coord).rgb;\n" +	
		   
		   
		 //BLINN-PHONG SHADING
		"vec3 H;\n" +
		"vec3 LaddV;;\n" +
		"\n" +
		"\n" +
		    

		   
		   
		   ////SPECULAR FOR POINT LIGHT
		   //"float lon = clamp( dot( L, N), 0.f, 1.f ) ;\n" +
		   // "vec3 reflection_vec = reflect( -L, N) ;\n" +
		   // "R = normalize( reflection_vec );\n" +
		   // "float rov = clamp ( dot( R, V ), 0.f, 1.f );\n" +
		   // "float specular = material.specular_intensity * pow(rov, material.specular_power);\n" +
		
		"for( i=0 ; i<4 ; ++i ){\n" +
								
			"light_ray = point_light.lights[i].position_ws - position_ws ;\n" +
			
			"L = normalize( light_ray );\n" +
			
			"LaddV = L + V;\n" +
			
			"H = LaddV/length( LaddV );\n" +
			
			"reflection_vec = reflect( -L, N) ;\n" +
		    
			"R = normalize( reflection_vec );\n" +
			
			"aten = clamp((1.0 - length(L) / point_light.lights[i].r), 0.f, 1.f ) ;\n" + 
			
			"aten *= aten;\n" +
			
			"nol = clamp( dot( N, L), 0.f, 1.f ) ;\n" +
			
			//"float rov = clamp ( dot( R, V ), 0.f, 1.f );\n" +
			
			//BLINN-PHONG
			
			"float rov = clamp ( dot( N, H ), 0.f, 1.f );\n" +
			
			"float specular = material.specular_intensity * pow(rov, material.specular_power);\n" +
			
			"spec += clamp((aten*specular*point_light.lights[i].color), 0.f, 1.f );\n" +
			
			"diffuse += clamp((nol*material.color*point_light.lights[i].color*aten*tex), 0.f, 1.f );\n" +
			
		"}\n" +
		
		//DIRECTION LIGHT CALCULATIONS
		"direct_light_ray = normalize ( direct_light.direction_ws ) ;\n" +
		
		"float nol_direct;\n" +
		
		"nol_direct = direct_light.intensity*clamp( dot( N, direct_light_ray), 0.f, 1.f ) ;\n" +		   
		//SPECULAR FOR DIRECT LIGHT
		"LaddV = direct_light_ray + V;\n" +
			
		"H = LaddV/length( LaddV );\n" +
		
		"vec3 directional_reflection_vec = reflect( -direct_light_ray, N) ;\n" +
		
		"DR = normalize( directional_reflection_vec );\n" +
		
		//"float drov = clamp ( dot( DR, V ), 0.f, 1.f );\n" +
		//BLINN-PHONG
		"float drov = clamp ( dot( N, H ), 0.f, 1.f );\n" +
		
		"float directional_specular = material.specular_intensity * pow(drov, material.specular_power);\n" +
		
		"directional_spec = directional_specular*direct_light.color;\n" +
		   
		   
		   
		   
		   
		   
		   
		   "result = clamp((diffuse + spec + nol_direct*material.color*direct_light.color*tex + directional_spec), 0.f, 1.f)  ;\n" + //
		   //"result = clamp((result + ambient_light.color + nol_direct*material.color*direct_light.color*tex + directional_spec  ), 0.f, 1.f)  ;\n" + //
	  
	   "vFragColor = vec4(result, 1.0);\n" +
    "}\n";
	
	let flame_fs_source = "#version 300 es\n" +
    // fs nie ma domyślnej precyzji dla liczb zmiennoprzecinkowych więc musimy wybrać ją sami
    "precision mediump float;\n" +
    "in vec3 position_ws;\n" +
    "in vec3 normal_ws;\n" +
    "in vec2 tex_coord;\n" +
    "out vec4 vFragColor;\n" +
	
    "void main()\n" +
    "{\n" +		
   
	   "vFragColor = vec4(1., 0.5, 0.1, 1.0);\n" +
    "}\n";

	
	
	
	let teapot_fs_source = "#version 300 es\n" +
    // fs nie ma domyślnej precyzji dla liczb zmiennoprzecinkowych więc musimy wybrać ją sami
    "precision mediump float;\n" +
    "in vec3 position_ws;\n" +
    "in vec3 normal_ws;\n" +
    "in vec2 tex_coord;\n" +
    "out vec4 vFragColor;\n" +
	
	"struct PLD\n" +
	"{\n" +
	"	vec3 position_ws;\n" +
	"	float r;\n" +
	"	vec3 color;\n" +
	"}PLD_Lights;\n" +
	"\n" +
	
	 
	
	"layout(std140) uniform CamInfo\n" +
    "{\n" +
       "vec3 cam_pos_ws;\n" +
    "} additional_data;\n" +
	
	// "layout(std140) uniform CheckerColor\n" +
    // "{\n" +
        // "vec3 triangle_color_a;\n" +
		// "vec3 triangle_color_b;\n" +
    // "};\n" +
	
	"layout(std140) uniform CheckerColor\n" +
    "{\n" +
       "PLD lights[4];\n" +
    "} point_light;\n" +
    
	"void main()\n" +
    "{\n" +		
	
		"vec3 result;\n" +
	   
	   "vec3 spec;\n" +
	   
	   "vec3 diffuse;\n" +
	   
	   "vec3 directional_spec;\n" +
	   
	   "vec3 light_ray ;\n" +
	   
	   "vec3 direct_light_ray ;\n" +
	   
	   "vec3 view_direction ;\n" +
	   
	   "vec3 reflection_vec;\n" +
	   
	   "vec3 R ;\n" +
	   
	   "vec3 DR ;\n" +
	   
	   "vec3 L;\n" +
	   
	   "int i = 0;\n" +
	   
	   "float nol;\n" +
	   
	   "float aten;\n" +
	   
	   "float rov;\n" +
	   
	   "float nov;\n" +
	
	
		"float scale = 1.;\n" +
		
		"float scale1 = 1.;\n" +
		
		"vec3 N = normalize( normal_ws );\n" + 
		
		"view_direction = additional_data.cam_pos_ws - position_ws ;\n" +
		
		"vec3 V = normalize( view_direction ) ;\n" +
		
		
		"for( i=0 ; i<4 ; ++i ){\n" +
								
			"light_ray = point_light.lights[i].position_ws - position_ws ;\n" +
			
			"L = normalize( light_ray );\n" +
			
			"reflection_vec = reflect( -L, N) ;\n" +
		    
			"R = normalize( reflection_vec );\n" +
			
			"aten = clamp((1.0 - length(L) / point_light.lights[i].r), 0.f, 1.f ) ;\n" + 
			
			"aten *= aten;\n" +
			
			"nol = clamp( dot( N, L), 0.f, 1.f ) ;\n" +
			
			//"float rov = clamp ( dot( R, V ), 0.f, 1.f );\n" +
			
			//"float specular = material.specular_intensity * pow(rov, material.specular_power);\n" +
			
			"rov = clamp ( pow(dot( R, V ), 2.), 0., 1.f );\n" +
			
			"nov = clamp ( dot( N, V )*dot( N, V )*dot( N, V ), 0.f, 1.f );\n" +
			
			"spec += clamp((aten*rov*point_light.lights[i].color), 0.f, 1.f );\n" +
			
			"diffuse += clamp((nov*spec), 0.f, 1.f );\n" +
			
		"}\n" +
		
		// "float x = mix( triangle_color_a[0], triangle_color_b[0], ( step( scale*tex_coord[1], scale1*0.5) )==( step( scale*tex_coord[0], scale1*0.5 )));\n" +
		// "float y = mix( triangle_color_a[1], triangle_color_b[1], ( step( scale*tex_coord[1], scale1*0.5) )==( step( scale*tex_coord[0], scale1*0.5 )));\n" +
		// "float z = mix( triangle_color_a[2], triangle_color_b[2], ( step( scale*tex_coord[1], scale1*0.5) )==( step( scale*tex_coord[0], scale1*0.5 )));\n" +
		
		";\n" +
		";\n" +
		";\n" +
		";\n" +
		"vFragColor = vec4( diffuse, 1 );\n" +		
    "}\n";
	
	
main();



