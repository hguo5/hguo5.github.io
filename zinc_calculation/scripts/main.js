var YEARS = [];

$(document).ready(function(){
	var years = [];
	YEARS = [];
	for (var i = 0; i < zinc_outputs.length + 2; i += 2) {
			if (i >= zinc_outputs.length) {
				year = zinc_outputs[i - 2] +1;
				output = 0
			}
			else{
				year = zinc_outputs[i];
				output = zinc_outputs[i + 1];
			}
			YEARS.push(year)
			
			html_text = "";
			html_text += "<div class=\"row\"><div class=\"col-md-3\">";
			html_text += "<span id=\"year_"+ year + "\">" + year + "</span>年产量：";
			html_text += "<input class=\"form-control parainput\" id=\"output_"+ year + 
				"\" required=\"\" value=\""+output+"\" type=\"number\" /></div>";

			html_text += "<div class=\"col-md-2\">总报废量：";
			html_text += "<input class=\"form-control parainput\" readonly id=\"result_"+year+
				"\" type=\"number\" /> </div><div>";
	
			html_text += "<div class=\"col-md-7\">";
			html_text += "<span id=\"show_year_"+year+"\">2022</span>年报废量：";
			html_text += "<span id=\"zongliang_"+year+"\">0.0</span>";
			html_text += "× 镀锌率<span id=\"bili_"+year+"\">0.45</span>";
			html_text += "× 报废率<span id=\"baofei_"+year+"\">0.0</span>";
			html_text += "× 折损率<span id=\"zhesun_"+year+"\">0.0</span> = ";
			html_text += "<input class=\"form-control parainput\" readonly id=\"result_show_"+year+
				"\" type=\"number\" /> </div></div>";

			$("#results_by_year").append(html_text)

			if (i == 0) continue;

			if (i == zinc_outputs.length) {
				$("#show_year").append("<option value=" + year + " selected>" + year + "</option>");
			}
			else {
				$("#show_year").append("<option value=" + year + ">" + year + "</option>");
			}
	}

	calculate();
});

function calculate() {
	var bili = parseFloat($("#bili" ).val());
	if (bili < 0) bili = 0;
	if (bili > 1) bili = 1;
	var shouming = parseFloat($("#shouming" ).val());
	if (shouming < 1) shouming = 1;
	var sigma = parseFloat($("#sigma" ).val());
	var t = parseFloat($("#t" ).val());

	var showyear = $("#show_year" ).val();

	var year;
	var data = {};
	for (var i = 0; i < YEARS.length; i += 1){
		year = YEARS[i];
		var ooo = parseFloat($("#output_"+year ).val());
		if (ooo < 0) ooo = 0;
		data[year] = ooo;
	}

	for (var i = 0; i < YEARS.length; i += 1){
		year = YEARS[i];
		$("#zongliang_"+year).html(data[year].toFixed(3));
		$("#bili_"+year).html(bili.toFixed(3));
		$("#show_year_"+year).html(showyear);
		$("#baofei_"+year).html(0.0.toFixed(3));
		$("#zhesun_"+year).html(0.0.toFixed(3));
		$("#result_show_"+year).val(0.0.toFixed(3));
		$("#result_"+year).val(0.0.toFixed(5));
	}

	var text_results = "<p>年份&emsp;报废量</p>";

	for (var i = 1; i < YEARS.length; i += 1){
		var result = 0.0;
		for (var j = 0; j < i; j+=1){
			var ooo = data[YEARS[j]];
			ooo = ooo * bili;

			var baofeilv = 1 / (Math.sqrt(2 * Math.PI) * sigma) * Math.exp(-Math.pow(i-j-t, 2) / 2 / sigma / sigma);
			if (baofeilv < 0) baofeilv = 0;
			if (baofeilv > 1) baofeilv = 1;

			ooo = ooo * baofeilv;
			var zhesunlv = 1 - (i - j) / shouming;
			if (zhesunlv < 0) zhesunlv = 0;
			if (zhesunlv > 1) zhesunlv = 1;
			ooo = ooo * zhesunlv;

			if (YEARS[i] == showyear) {
				year = YEARS[j];
				$("#baofei_"+year).html(baofeilv.toFixed(3));
				$("#zhesun_"+year).html(zhesunlv.toFixed(3));
				$("#result_show_"+year).val(ooo.toFixed(5));
			}

			result += ooo;
		}
		$("#result_"+YEARS[i]).val(result.toFixed(5));
		text_results += "<p>" + YEARS[i] + "&emsp;" + result + "</p>";
	}

	$("#textual_results").html(text_results);

}


function show_text_results() {
  var x = document.getElementById("textual_results");
  if (x.style.display === "none") {
    x.style.display = "block";
  } else {
    x.style.display = "none";
  }
}
