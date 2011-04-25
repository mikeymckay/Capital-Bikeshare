/*
	// example code:
	var	NY_lat = (40 + 42/60 + 15/60/60) * Math.PI/180,
		NY_long = -(73 + 55/60 + 5/60/60) * Math.PI/180;

	var	Sydney_lat = -(33 + 52/60 + 12/60/60) * Math.PI/180,
		Sydney_long = (151 + 12/60 + 36/60/60) * Math.PI/180;

	// distance in meters:
	var dist_NY_Sydney = distance(NY_lat, Sydney_lat, NY_long - Sydney_long);
*/

(function() {
	var	a = 6378137,
		b = (6378137 * 297.257223563) / 298.257223563,
		R_m = Math.pow(a * a * b, 1/3);

	function cylindrics(phi) {
		var	u = a * Math.cos(phi),
			v = b * Math.sin(phi),
			w = Math.sqrt(u * u + v * v),

			r = a * u / w,
			z = b * v / w,
			R = Math.sqrt(r * r + z * z);

		return { r : r, z : z, R : R };
	}

	this.distance = function(phi1, phi2, dLambda, small) {
		with(cylindrics(phi1)) {
			var	r1 = r,
				z1 = z,
				R1 = R;
		}

		with(cylindrics(phi2)) {
			var	r2 = r,
				z2 = z,
				R2 = R;
		}

		var	cos_dLambda = Math.cos(dLambda),
			scalar_xy = r1 * r2 * cos_dLambda,
			cos_alpha = (scalar_xy + z1 * z2) / (R1 * R2);

		if(small) {
			var	dr2 = r1 * r1 + r2 * r2 - 2 * scalar_xy,
				dz2 = (z1 - z2) * (z1 - z2),
				R = Math.sqrt((dr2 + dz2) / (2 * (1 - cos_alpha)));
		}
		else R = R_m;

		return R * Math.acos(cos_alpha);
	};
})();
