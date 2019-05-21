var projects;
var authors;

var vars=getUrlVars();
var lng="es";
//if(vars["lng"]) lng=vars["lng"];

function getUrlVars() 
{
	var vars = {};
	var parts = window.location.href.replace(/[?&#]+([^=&#]+)=([^&#]*)/gi, function(m,key,value) 
	{
		vars[key] = value;
	});
	return(vars);
}


function email_isvalid(email)
{
  var regex = /^([a-zA-Z0-9_.+-])+\@(([a-zA-Z0-9-])+\.)+([a-zA-Z]{2,4})+$/;
  return(regex.test(email));
}

function show_project_info(prj)
{
	$(".project_title").text(projects[prj].title);
	$(".project_video iframe").attr("src","https://player.vimeo.com/video/"+projects[prj].video+
											  "?title=0&byline=0&portrait=0");
	$(".project_dossier").attr("href","data/projects/dossiers/"+projects[prj].dossier);
   fetch("data/projects/info/"+projects[prj].info)
     .then(function(response){
			 return response.text().then(function(text){
			 		$(".project_description").html(text); 
		    });
     })
     .catch(function(error){ 
   	console.log(error); 
     });   
   									     
	$(".author_name").text(authors[projects[prj].author].name);
	$(".author_bio").text(authors[projects[prj].author].bio);
	
	$(".author_picture").attr("src","data/authors/pictures/"+authors[projects[prj].author].picture);
}

function show_projects(grid,func)
{
	$(grid).html("");

   var preload=Object.keys(projects).length;
   
	for(var key in projects) 
	{
		var prj=$("#dummy .project_item").clone();
		prj.find(".project_data_title").text(projects[key].title);
		prj.find(".project_data_author").text(authors[projects[key].author].name);
		prj.find(".project_data_info").text(projects[key].description);
	
		prj.find(".project_link").attr("data-project",key);
		prj.find(".project_link").attr("href","project.html?id="+key);	

		prj.find("img")[0].onload=function()
		{
			preload--;
			if(preload==0) func();
		};
		prj.find("img").attr("src","data/projects/previews/"+projects[key].preview);		
		$(grid).append(prj);
	}
}

function load_json(file,func)
{
	 fetch(file)
     .then(function(response){
			 return response.json().then(function(data)
			 {
			 		func(data);	 
		    });
     }).catch(function(error){ 
   		console.log(error); 
     		});   
}

function load_data(func)
{
		load_json("data/projects/index.json?5",function(data){
			projects=data;
			load_json("data/authors/index.json?5",function(data){
					authors=data;	
					func();				
				})
		});	
}

function rand(from,to)
{
	return((Math.random() * to) + from);
}

var circles=[];
var lines;
var anim={"from":-20,"to":20,
			 "speed_from":200,"speed_to":1000,
			 "init_speed_from":500,"init_speed_to":1500};

function get_lines(mesh,x,y,r)
{
	var ret=[];
	for(var b=0;b<lines.length;b++)
	{
		for(var c=1;c<3;c++)
		{
			var cx=parseFloat($(lines[b]).attr("x"+c));
			var cy=parseFloat($(lines[b]).attr("y"+c));
		
			if(((cx>parseFloat(x-r)) && (cx<parseFloat(x+r))) &&
   			((cy>parseFloat(y-r)) && (cy<parseFloat(y+r))))
   			{
					//console.log("Punto encontrado ("+c+") en línea: " + b);		
					var l=[];
					l["index"]=b;
					l["point"]=c;
					ret.push(l);
   				
   				//$(lines[b]).css("stroke","#ff0000");
   				//break;
		  		}
		}
   }
   return(ret);
}
function init_mesh(mesh)
{
	$(mesh).find("polyline").hide();
	$(mesh).find("polygon").hide();
	lines=$(mesh).find("line");	
	console.log("Lines: "+lines.length);
	
	var c=$(mesh).find("circle");
	console.log("Circles: "+c.length);
	for(a=0;a<c.length;a++) //c.length;a++)
	{
  	   //console.log("Circle: "+a);
		var ci=[];
		ci["div"]=c[a];
		ci["cx"]=$(c[a]).attr("cx");
		ci["cy"]=$(c[a]).attr("cy");
		ci["r"]=$(c[a]).attr("r");
		ci["lines"]=get_lines(mesh,parseFloat(ci["cx"]),
										   parseFloat(ci["cy"]),
										   parseFloat(ci["r"])/2);	
		circles.push(ci);
		
		$(c[a]).css("left","-100px"); //ci["cx"]+"px");
		$(c[a]).css("top",ci["cy"]+"px");
	}
}

function start_animation(circle,tx,ty,time)
{
	var x=$(circle.div).attr("cx");
	var y=$(circle.div).attr("cy");
	
	$(circle.div).animate(
        	{
        		"left":(parseFloat(circle.cx)+tx),
        		"top":(parseFloat(circle.cy)+ty)
        	},
        	{
            step: function(val,fx){
            	
                 if(fx.prop=="left")
                 		$(circle.div).attr('cx', val);
                 else
                 		$(circle.div).attr('cy', val);
                 		
                 for(var c=0;c<circle.lines.length;c++)
                 {
                 	   var n=circle.lines[c].point;
                 	   var i=circle.lines[c].index;
                 	   $(lines[i]).attr("x"+n,$(circle.div).attr('cx'));
                 	   $(lines[i]).attr("y"+n,$(circle.div).attr('cy'));                 	   
                 }
                 
            	},
            done: function(){
            	tx=rand(anim.from,anim.to);
            	ty=rand(anim.from,anim.to);
            	start_animation(circle,tx,ty,rand(anim.init_speed_from,anim.init_speed_to));
            },
            duration: time
        	}
    	);
}
function animate_mesh(mesh)
{
	init_mesh(mesh);
	for(a=0;a<circles.length;a++) 
	{
		start_animation(circles[a],rand(anim.from,anim.to),
							 rand(anim.from,anim.to),rand(anim.speed_from,anim.speed_to));            
	}
}

$(document).ready(function()
{
	if($(".projects_grid").length>0)
		load_data(function()
			{
				show_projects($(".projects_grid"),function(){
						setTimeout(function(){
							$(".projects_grid").removeClass("hidden");
							$(".projects_grid").parent().find(".loading").remove();
						},2000);				
				});
			});
	
   if($(".project_info").length>0)
   {
   	if(vars["id"])
   	{
   		load_data(function(){
				if(!projects[vars["id"]]) window.location.href=".";
   			else show_project_info(vars["id"]);
				});
   	}else{
   		window.location.href=".";
   	}
   }	

   $(".nav-link").click(function(event){
   		var target = $(this).attr("href");
   		if(target.length) 
			{
				if($(target).length)
				{
					event.preventDefault();
			   	$('html, body').stop().animate({
            		scrollTop: $(target).offset().top
        			},1000);
        		}
        	}
   });

   $("#contact input, #contact textarea").on('input',function()
   {
   	$(".contact_result").hide();   
   });
   $("#btn_contact").click(function()
   {
   	$(".contact_result").hide();
		var email=$("#contact_email").val().trim();
		var remail=$("#contact_remail").val().trim();
		var msg=$("#contact_message").val().trim();
		if(((email.length==0) || (remail.length==0)) || (msg.length==0)) 
		{
			$(".error_empty").show();
			return(false);
      }		
		if(!email_isvalid(email))
		{
			$(".error_email").show();
			return(false);
		}
		if(email!=remail)
		{
			$(".error_remail").show();
			return(false);
		}
		
 		var params={"function": "contact", "email":email,"text":msg, "lng": lng};		
		$.post("https://2017.steamconf.com/mesh/email.php",params)
			   .done(function(data)
			   {
			   	alert(data);
			   	var res=JSON.parse($.trim(data));
					if(res.result=="ok") 
						$(".result_ok").show();					
			   		
			   }).fail(function(xhr, status, error)
			     {
						$(".error_server").show();
   		     });
   	return(false); 	     
   });

   var svg_mesh=document.getElementById("mesh-hero-bg-graphic");
   if(svg_mesh)
   {
   	svg_mesh.onload=function()
   	{
   		animate_mesh($(this.contentDocument));
   	};
   	$("#mesh-hero-bg-graphic").attr("data",$("#mesh-hero-bg-graphic").attr("data-svg"));
   }
});
