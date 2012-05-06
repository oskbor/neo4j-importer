console.log("-- Neo4j Import Nodes --");

//TEST-FILE
var import_data = [
					{
						"id":"1",
						"cname1":"USA",
						"cname2":"SWE",
						"ccode1":"2",
						"ccode2":"20",
						"year":"2009",
						"trade":"228376",
						"continent_name":"America",
						"continent_id":"1"
					},
					{
						"id":"2",
						"ccode1":"3",
						"ccode2":"30",
						"cname1":"CAN",
						"cname2":"DEN",
						"year":"2009",
						"trade":"228376",
						"continent_name":"America",
						"continent_id":"1"
					},
					{
						"id":"3",
						"cname1":"MEX",
						"cname2":"USA",
						"ccode1":"4",
						"ccode2":"2",
						"year":"2009",
						"trade":"228376",
						"contname1":"America",
						"continent_id":"1"
					}			
				];
				

var config_nodes = [
					{
						"name":"$cname1",
						"type":"country",
						"code":"$ccode1",
					},
					{
						"name":"$cname2",
						"code":"$ccode2",
						"type":"country"			
					}
				];

					
var config_relationships = [];					


function checkIfNodeVariable(string){
	if(string.charAt(0) == "$"){
		return true;
	}else{
		return false;
	};
};

function checkIfEmpty(array){
	//TODO
	return false;
};

function sortObjectKeys(o) {
    var sorted = {},
    key, a = [];
    for (key in o) {
        if (o.hasOwnProperty(key)) {
                a.push(key);
        }
    }
    a.sort();
    for (key = 0; key < a.length; key++) {
        sorted[a[key]] = o[a[key]];
    }
    return sorted;
};

function removeDuplicates(arr) {
  var i,
      len=arr.length,
      out=[],
      obj={};

  for (i=0;i<len;i++) {
    obj[JSON.stringify(arr[i])]=0;
  }
  for (i in obj) {
    out.push(JSON.parse(i));
  }
  return out;
}

function createNodesFromData(import_data, config_nodes){
	var new_nodes = [];

	config_nodes.forEach(function(node){
		import_data.forEach(function(data){
			var new_node = {};
			for(var node_key in node){				
				if(checkIfNodeVariable(node[node_key])){
					for(var data_key in data){
						if(node[node_key].substr(1) == data_key){
							new_node[node_key] = data[data_key];
						};
					};
				}else{
					new_node[node_key] = node[node_key];
				};	
			};
			if(!(checkIfEmpty(new_node))){
				new_nodes.push(sortObjectKeys(new_node));
			};	
		});
	});
	
	// Remove duplicates
	new_nodes = removeDuplicates(new_nodes);
	
	return new_nodes;
};

//Create all new nodes
var new_nodes = createNodesFromData(import_data, config_nodes);
	console.log("pre-sort: " + JSON.stringify(new_nodes)); //Test

	
	
	
	
	
	