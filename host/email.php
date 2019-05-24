<?php
// Error en cabeceras por HEADER already sent por BOM? o espacios antes de etiquetas PHP
set_CORS();

ini_set('display_errors', 1);
ini_set('error_reporting', E_ALL);

if(isset($_POST["function"]))
{
	if(is_callable($_POST["function"]))
	{
		$res=call_user_func($_POST["function"],$_POST); //,$config);
		die($res);
	}
}
die(returnError("error_func"));

function set_CORS()
{
	
	if (!isset($_SERVER['HTTP_ORIGIN'])) exit;

	$wildcard = TRUE; // Set $wildcard to TRUE if you do not plan to check or limit the domains
	$credentials = FALSE; // Set $credentials to TRUE if expects credential requests (Cookies, Authentication, SSL certificates)
	$allowedOrigins = array('http://zinoui.com', 'http://jsfiddle.net');
	if (!in_array($_SERVER['HTTP_ORIGIN'], $allowedOrigins) && !$wildcard) exit;

	$origin = $wildcard && !$credentials ? '*' : $_SERVER['HTTP_ORIGIN'];

	header("Access-Control-Allow-Origin: " . $origin);
	if ($credentials)
   	 header("Access-Control-Allow-Credentials: true");
	
	header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
	header("Access-Control-Allow-Headers: Origin");
	header('P3P: CP="CAO PSA OUR"'); // Makes IE to support cookies

	if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') exit;

	//die(json_encode(array('status' => 'OK')));
}

function returnError($error)
{
  return('{"result":"error","type":"'.$error.'"}');
} 


function get_string_between($content,$start,$end)
{
    $r = explode($start, $content);
    if (isset($r[1])){
        $r = explode($end, $r[1]);
        return $r[0];
    }
    return '';
}


function contact($values) //,$config)
{
   //if(isset($values["comments"]))
   //		if($values["comments"]!="") return(returnError("error_bot"));

	if(!isset($values["name"])) return(returnError("error_params"));
	if(!isset($values["email"])) return(returnError("error_params"));
	if(!isset($values["lng"])) return(returnError("error_params"));

	if(isset($values["subscribe"])) return(subscribe($values));

	if(!isset($values["text"])) return(returnError("error_params"));

   $to="jose@soko.tech";
   $from="Mesh <mesh@soko.tech>";
   $subject="MESH contact";
	if(!mail($to, $subject,$values["text"],
			"MIME-Version: 1.0\n".
			"Content-type: text/html; charset=utf-8;\n".
			"From: ".$from."\n".
			"Reply-To: ".$values["name"]."<".$values["email"].">\n"))
				return(returnError("error_sending"));
	$res["result"]="ok";
  
   return(json_encode($res));
}

function subscribe($values) //,$config)
{
	$lng=$values["lng"];
	if($lng=="es") $lng="es_ES"; 
	$authToken = '14748d7cfdc293d666008c8091869fb5-us17';
	$postData = array(
    	"email_address" => addslashes($values["email"]), 
    	"status" => "subscribed", 
    	"language" => addslashes($lng), 
    	"merge_fields" => array(
    		"FNAME"=> addslashes($values["name"]))
		);
		
	$list_id="eb109a5aea";
	$ch = curl_init('https://us17.api.mailchimp.com/3.0/lists/'.$list_id.'/members/');

	curl_setopt_array($ch, array(
   	 CURLOPT_POST => TRUE,
    	CURLOPT_RETURNTRANSFER => TRUE,
    	CURLOPT_HTTPHEADER => array(
      	 'Authorization: apikey '.$authToken,
          'Content-Type: application/json'
    	),
    	CURLOPT_POSTFIELDS => json_encode($postData)
	));
	$response = curl_exec($ch);
   //return($response);
	return('{"result":"ok"}');
}


?>