var selected = [];
var freq = [];

$(document).ready(function(){
	var i;
	freq = Array(keywords.length).fill(0);
	for (i=0;i<breaches.length;i++) {
		bid = breaches[i]["ID"];
		klist = breaches[i]["BIDs"];
		for (j=0;j<klist.length;j++) {
			kid = klist[j];
			freq[kid] += 1;
		}
	}
	for (i = 0; i < keywords.length; i++) {
		$("#keylist").append("<button id=\"key_"+keywords[i]["ID"]+"\" onclick=\"addKeywords("+keywords[i]["ID"]+")\">" +keywords[i]["K"]+ 
		"<span class=\"freq\">" + freq[i] + "</span>" +
		"<span class=\"checkmark\"><div class=\"checkmark_stem\"></div><div class=\"checkmark_kick\"></div></span></button>");
	}
  
	getSuggestions();
	getFrequentWords();
});

function filterFunction() {
  var input, filter, ul, li, a, i;
  input = document.getElementById("keyinput");
  filter = input.value.toUpperCase().trim();
  div = document.getElementById("keylist");
  a = div.getElementsByTagName("button");
  for (i = 0; i < a.length; i++) {
    txtValue = a[i].textContent || a[i].innerText;
    if (txtValue.toUpperCase().indexOf(filter) ==0) {
      a[i].style.display = "";
    } else {
      a[i].style.display = "none";
    }
  }
}

function addKeywords(key) {
	for (i = 0; i < selected.length; i++) {
		if (key == selected[i]){
			return;
		}
	}
	selected.push(key);
	
	$("#selectedTags").html("");
	for (i = 0; i < selected.length; i++) {
		kid= selected[i];
		$("#selectedTags").append("<span class=\"keywordtag\">"+keywords[kid]["K"]+"<button class=\"close\" onclick=\"removeKeywords("+keywords[kid]["ID"]+")\">x</button></span>");
	}
	
	for (i = 0; i < keywords.length; i++) {
		if (selected.indexOf(i) != -1) {
			$("#key_"+i).find( ".checkmark" ).css( "display", "inline-block" );
		}
		else{
			$("#key_"+i).find( ".checkmark" ).css( "display", "none" );
		}
    }
	$("#keyinput").val("");
	filterFunction();
	
	getFrequentWords();
	
	getSuggestions();
}

function removeKeywords(key) {
	if (selected.indexOf(key) == -1)
		return
	selected = selected.filter((item) => item !== key)
	
	if (selected.length==0){
		$("#selectedTags").html("No keywords selected.");
	}
	else{
		$("#selectedTags").html("");
		for (i = 0; i < selected.length; i++) {
			kid= selected[i];
			$("#selectedTags").append("<span class=\"keywordtag\">"+keywords[kid]["K"]+"<button class=\"close\" onclick=\"removeKeywords("+keywords[kid]["ID"]+")\">x</button></span>");
		}
	}
		
	for (i = 0; i < keywords.length; i++) {
		if (selected.indexOf(i) != -1) {
			$("#key_"+i).find( ".checkmark" ).css( "display", "inline-block" );
		}
		else{
			$("#key_"+i).find( ".checkmark" ).css( "display", "none" );
		}
	}
	
	getSuggestions();
	getFrequentWords();
}

function getFrequentWords(){
	var kweights = Array(keywords.length).fill(0.0);
	for (i=0;i<breaches.length;i++) {
		weight = 1.0;
		bid = breaches[i]["ID"];
		klist = breaches[i]["BIDs"];
		if (selected.length>0){
			for (j=0;j<selected.length;j++) {
				if (klist.includes(selected[j])){
					weight *= keywords.length;
				}
			}
		}
		for (j=0;j<klist.length;j++) {
			kid = klist[j];
			kweights[kid] += weight/keywords.length;
		}
	}
	var items = [];
	for (i=0;i<kweights.length;i++) {
		if (selected.includes(i)){
			continue;
		}
		items.push([i, kweights[i]]);
	}
	
	items.sort(function(first, second) {
	  return second[1] - first[1];
	});
	
	var top10 = items.slice(0, 10);
	insert_html = "";
	for (i=0;i<top10.length;i++) {
		www = Math.log(top10[i][1])/10 + 3;
		www = Math.round(www*10000)/10000;
		if (www<=0){
			break;
		}
		insert_html += "<button onclick=\"addKeywords("+top10[i][0]+")\">" + keywords[top10[i][0]]["K"] + 
					"<span class=\"freq\">" + freq[top10[i][0]] + "</span>" +
					"</button>";
	}
	$("#suggestions").html(insert_html);
}


function getSuggestions(){
	//rank clusters by relevance
	var cweights = Array(cluster_centers.length).fill(0.0);
	
	for (i=0;i<breach_clusters.length;i++) {
		weight = 1.0;
		for (j=0;j<selected.length;j++) {
			if (keywords[selected[j]]["BIDs"].includes(breach_clusters[i]['ID'])){
				weight *= breach_clusters.length;
			}
			else {
				for (k=0;k<keywords[selected[j]]["Sim"].length;k++){
					kid = keywords[selected[j]]["Sim"][k][0];
					sim = keywords[selected[j]]["Sim"][k][1];
					if (sim<0.5){
						break;
					}
					if (keywords[kid]["BIDs"].includes(breach_clusters[i]['ID'])){
						weight *= breach_clusters.length * 0.05 * sim;
						break;
					}
				}
				
			}
		}
		for (j=0;j<breach_clusters[i]["Clusters"].length; j++){
			C = breach_clusters[i]["Clusters"][j];
			cweights[C] += weight/breach_clusters.length;
		}
	}
	
	var items = [];
	for (i=0;i<cweights.length;i++) {
		items.push([i, cweights[i]]);
	}

	// Sort the array based on the second element
	items.sort(function(first, second) {
	  return second[1] - first[1];
	});

	var top10 = items.slice(0, 20);
	insert_html = "<ul>";
	for (i=0;i<top10.length;i++) {
		www = Math.log(top10[i][1])/7.5 + 1;
		if (selected.length>1) {
			www /= selected.length
		}
		www = Math.round(www*10000)/10000;
		if (www<=0)
			break;
		
		insert_html += "<li>"
		if (cluster_centers[top10[i][0]]["Subject"].length>0){
			for (j=0;j<cluster_centers[top10[i][0]]["Subject"].length;j++){
				insert_html += "<a class=\"leftspan\">" + cluster_centers[top10[i][0]]["Subject"][j] + "</a>";
			}
		}
		
		insert_html += (cluster_centers[top10[i][0]]["VerbPhrase"]+"<span>"+www+"</span></li>");
	}
	if (insert_html=="<ul>"){
		insert_html += "<li>[NONE]<span>0.0000</span></li>";
	}
	insert_html += "</ul>";
	
	$("#suggestionResults").html(insert_html);

}