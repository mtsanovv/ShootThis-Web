var loginConfig = {
	//make sure that this is valid (like JSON) and has the right parameters or you can run into some nasty errors
	//logins are sorted by priority (most reliable servers on top)
	//IMPORTANT! - all login servers should be like login1, login2 etc., where 1, 2, 3 are unique CONSEQUENT numbers
	"login1": {
		"address": "//localhost",
		"port": 9903,
		"protocol": "http:"
	},
	"login2": {
		"address": "//192.168.191.1",
		"port": 9904,
		"protocol": "http:"
	},
	"login3": {
		"address": "//5.206.227.98",
		"port": 9907,
		"protocol": "http:"
	}
};