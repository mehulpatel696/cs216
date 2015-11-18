
// //-------------------------- CREATE SPHERE ----------------------------------

// function Sphere(){

// 	//Texture Coordinates 
// 	// var ta = vec2(0,0);
// 	// var tb = vec2(1,0);
// 	// var tc = vec2(1,1);
// 	// var td = vec2(0,1);

// 	var S = { 	

// 				positions : [],
// 				vertices: [],
// 		 	  	normals: [], 
// 		 	  	texCoords: [],
// 		 	  	triangles: [],
// 		 	  	material: {	Ka: vec3(0.9, 0.9, 0.9),
// 		 	  				Kd: vec3(0.7, 0.1, 0.6),
// 		 	  				Ks: vec3(0.9, 0.9, 0.9),
// 		 	  				shininess: 500
// 		 	  	},
// 		 	  	ModelMatrix: mat4(),
// 		 	  	diffuseTexture: ""


// 	};


// 	var numTimesToSubdivide = 5; 

// 	var s2 = Math.sqrt(2);
// 	var s6 = Math.sqrt(6);

// 	var va = vec3(0,0,1);
// 	var vb = vec3(0, 2 * s2/3, -1/3);
// 	var vc = vec3(-s6/3, -s2/3, -1/3);
// 	var vd = vec3(s6/3, -s2/3, -1/3);

// 	tetrahedron(va, vb, vc, vd, numTimesToSubdivide);

    
// 	function tetrahedron(a,b,c,d,n){

// 		divideTriangle(a,b,c,n);
// 		divideTriangle(d,c,b,n);
// 		divideTriangle(a,d,b,n);
// 		divideTriangle(a,c,d,n);

// 	}

// 	function divideTriangle(a,b,c,n){

// 		if(n>0){
        	
// 			var ab = normalize(mix(a,b,0.5));
// 			var ac = normalize(mix(a,c,0.5));
// 			var bc = normalize(mix(b,c,0.5));

// 			//console.log(ab,ac,bc);

// 			n--;

// 			divideTriangle(a,ab,ac,n);
// 			divideTriangle(ab,b,bc,n);
// 			divideTriangle(bc,c,ac,n);
// 			divideTriangle(ab,bc,ac,n);

// 		}
// 		else{
// 			triangle(a,b,c);
// 		}
// 	}

// 	function normal_mapping(a,b,c){

// 		var a_norm = normalize(a);

// 		//Calculate E1 and E2
// 		var E1 = subtract(b,a);
// 		var E2 = subtract(c,b);

// 		//Expand to Three Coordinates 
// 		var matrix1 = mat3(vec3( b[0] - a[0] , b[1] - a[1],0), vec3(c[0] - b[0], c[1] - b[1],0), vec3(0,0,1));
// 		var matrix2 = mat3(	vec3(E1[0], E1[1], E1[2]),vec3(E2[0], E2[1], E2[2]), vec3(0,0,0));
// 		var matrix3 = mult( inverse(matrix1), matrix2 );

//         T = matrix3[0];
// 		B = matrix3[1];


// 		var r1 = (a_norm[0] + 1)/2;
// 		var g1 = (a_norm[1] + 1)/2;
// 		var b1 = (a_norm[2] + 1)/2;

// 		var lengthOfT = Math.sqrt( (T[0] * T[0]) + (T[1] * T[1]) + (T[2] * T[2]));
// 		T[0] = T[0] / lengthOfT;
// 		T[1] = T[1] / lengthOfT;
// 		T[2] = T[2] / lengthOfT;

// 		var lengthOfB = Math.sqrt( (B[0] * B[0]) + (B[1] * B[1]) + (B[2] * B[2]));
// 		B[0] = B[0] / lengthOfB;
// 		B[1] = B[1] / lengthOfB;
// 		B[2] = B[2] / lengthOfB;

// 		var lengthOfN = Math.sqrt( (a_norm[0] * a_norm[0]) + (a_norm[1] * a_norm[1]) + (a_norm[2] * a_norm[2]));
// 	   	a_norm[0] = a_norm[0] / lengthOfN;
// 	   	a_norm[1] = a_norm[1] / lengthOfN;
// 	   	a_norm[2] = a_norm[2] / lengthOfN;

// 		var c1 = 2*r1 - 1;
// 		var c2 = 2*g1 - 1; 
// 		var c3 = 2*b1 - 1;


// 		var p1 = vec3(c1*T[0],c1*T[1],c1*T[1]); 
// 		var p2 = vec3(c2*B[0],c2*B[1],c2*B[1]); 
// 		var p3 = vec3(c3*a_norm[0],c3*a_norm[1],c3*a_norm[1]); 

// 		var normal_prime = add(add(p1,p2),p3); 

// 		var aIndex = S.positions.indexOf(a);
// 		var bIndex = S.positions.indexOf(b);
// 		var cIndex = S.positions.indexOf(c);

// 		S.normals[aIndex] = add(S.normals[aIndex], normal_prime);
// 		S.normals[bIndex] = add(S.normals[bIndex], normal_prime);
// 		S.normals[cIndex] = add(S.normals[cIndex], normal_prime);

		
// 	}


// 	function triangle(a,b,c){
// 		S.vertices.push(a,b,c);

// 		var a_norm = normalize(a);
// 		var b_norm = normalize(b);
// 		var c_norm = normalize(c);

// 		if(S.positions.indexOf(a) === -1){

// 			S.positions.push(a);
			
// 			var r1 = 1 
// 			var theta1 = Math.atan2(Math.sqrt(a_norm[0]*a_norm[0] +  a_norm[1]*a_norm[1]), a_norm[2]); 
// 			var phi1 = Math.atan2(a_norm[1],a_norm[0]);

// 			var s = phi1/(2 * Math.PI);
// 			var t = theta1/Math.PI;
//             S.texCoords.push(vec2(-s,t));

// 		} 
// 		if(S.positions.indexOf(b) === -1){

// 			S.positions.push(b);
			
// 			var r2 = 1 
// 			var theta2 = Math.atan2(Math.sqrt(b_norm[0]*b_norm[0] + b_norm[1]*b_norm[1]), b_norm[2]); 
// 			var phi2 = Math.atan2(b_norm[1],b_norm[0]); 

// 			var s = phi2/(2 * Math.PI);
// 			var t = theta2/Math.PI;
//             S.texCoords.push( vec2(-s,t));

// 		} 
// 		if(S.positions.indexOf(c) === -1){

// 			S.positions.push(c);
			
// 			var r3 = 1
// 			var theta3 = Math.atan2(Math.sqrt(c_norm[0]*c_norm[0] + c_norm[1]*c_norm[1]), c_norm[2]); 
// 			var phi3 = Math.atan2(c_norm[1],c_norm[0]); 
			
// 			var s = phi3/(2 * Math.PI);
// 			var t = theta3/Math.PI;
//             S.texCoords.push( vec2(-s,t));
// 		} 

// 		var aIndex = S.positions.indexOf(a);
// 		var bIndex = S.positions.indexOf(b);
// 		var cIndex = S.positions.indexOf(c);

// 		S.triangles.push([aIndex, bIndex, cIndex]);

// 	}

// 	for(var i = 0; i < S.positions.length; i++) S.normals.push(vec3(0,0,0));
// 	for(var i = 0; i < S.positions.length; i++) normal_mapping( S.positions[S.triangles[i][0]],S.positions[S.triangles[i][1]],S.positions[S.triangles[i][2]]);
// 	for(var i = 0; i < S.normals.length; i++) S.normals[i] = normalize(S.normals[i]);
	

// 	return S;



// }