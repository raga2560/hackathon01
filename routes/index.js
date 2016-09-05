var SessionHandler = require('./session')
  , ContentHandler = require('./content')
  , SessionMobileHandler = require('./sessionmobile')
  , Sessioncolored = require('./sessioncolored')
  , Management = require('./management')
  , ErrorHandler = require('./error').errorHandler;

module.exports = exports = function(app, db) {

    var sessionHandler = new SessionHandler(db);
    var contentHandler = new ContentHandler(db);
	var sessionmobileHandler = new SessionMobileHandler(db);
	var sessioncolored = new Sessioncolored(db);
	var management = new Management(db);

    // Middleware to see if a user is logged in
    app.use(sessionHandler.isLoggedInMiddleware);

    // The main page of the blog
    app.get('/', contentHandler.displayMainPage);

    // The main page of the blog, filtered by tag
    app.get('/tag/:tag', contentHandler.displayMainPageByTag);

    // A single post, which can be commented on
    app.get("/post/:permalink", contentHandler.displayPostByPermalink);
    app.post('/newcomment', contentHandler.handleNewComment);
    app.get("/post_not_found", contentHandler.displayPostNotFound);

    // Displays the form allowing a user to add a new post. Only works for logged in users
    app.get('/newpost', contentHandler.displayNewPostPage);
    app.post('/newpost', contentHandler.handleNewPost);

    // Login form
    app.get('/login', sessionHandler.displayLoginPage);
    app.post('/login', sessionHandler.handleLoginRequest);

	
	
	
    // Logout page
    app.get('/logout', sessionHandler.displayLogoutPage);

    // Welcome page
    app.get("/welcome", sessionHandler.displayWelcomePage);

    // Signup form
    app.get('/signup', sessionHandler.displaySignupPage);
    app.post('/signup', sessionHandler.handleSignup);
	
	app.post('/confapp/register', sessionHandler.register);
	app.post('/confapp/admin/adminregister', sessionHandler.adminregister);
	app.post('/confapp/confapplogin', sessionHandler.confappLogin);
	app.post('/confapp/admin/confappadminlogin', sessionHandler.confappadminLogin);
	app.post('/confapp/admin/confappadminlogout', sessionHandler.confappadminLogout);
	app.get('/confapp/admin/getsession', sessionHandler.confappGetSession);
	
	app.get('/confapp/admin/getgallerylist', sessionHandler.getgallerylist);
    app.post('/confapp/admin/sendgallery', sessionHandler.sendgallery);
	
	app.get('/confapp/admin/getnotificationlist', sessionHandler.getnotificationlist);
    app.post('/confapp/admin/sendnotification', sessionHandler.sendnotification);
	
	app.get('/confapp/admin/getsocial', sessionHandler.getsocial);
    app.post('/confapp/admin/sendsocial', sessionHandler.sendsocial);
	
	app.get('/confapp/admin/gethome', sessionHandler.gethome);
    app.post('/confapp/admin/sendhome', sessionHandler.sendhome);

	app.get('/confapp/admin/getagenda', sessionHandler.getagenda);
    app.post('/confapp/admin/sendagenda', sessionHandler.sendagenda);
	
	app.get('/confapp/admin/getvenue', sessionHandler.getvenue);
    app.post('/confapp/admin/sendvenue', sessionHandler.sendvenue);

	app.post('/confapp/uploadImage', sessionHandler.uploadImage);
	
	


	//
	
	app.get('/confapp/mobile/geteventdetails', sessionmobileHandler.geteventdetails);
	app.get('/confapp/mobile/loadevent/:id', sessionmobileHandler.loadevent);
	app.get("/confapp/mobile/search/:str", sessionmobileHandler.confappsearch);
	
	app.get('/visual/getorderby/:what', sessionHandler.getorderby);
	
	app.get("/import", sessionHandler.import);
	app.get("/findone", sessionHandler.findone);
	app.get("/remove", sessionHandler.remove);
	
	app.get('/hackathon/getloginuser', sessioncolored.getloginuser);
	app.post('/hackathon/createkeys', sessioncolored.createkeys);
	app.get('/hackathon/getkeys', sessioncolored.getkeys);
	
	app.post('/hackathon/createtestasset', sessioncolored.createtestasset);
	app.get('/hackathon/getaddresscontents', sessioncolored.getaddresscontents);
	app.post('/hackathon/gettestnetassets', sessioncolored.gettestnetassets);
	app.post('/hackathon/signandsendasset', sessioncolored.signandsendasset);
	app.post('/hackathon/getassetowner', sessioncolored.getassetowner);
	app.post('/hackathon/getassetdetail', sessioncolored.getassetdetail);
	app.post('/hackathon/createevent', management.createevent);
	app.post('/hackathon/createseller', management.createseller);
	app.post('/hackathon/createbuyer', management.createbuyer);
	app.get('/hackathon/listevents', management.listevents);
	app.get('/hackathon/listowners', management.getowners);
	app.post('/hackathon/createasset', sessioncolored.createasset);
	app.post('/hackathon/updatetx', sessioncolored.updatetx);
	
	app.post('/hackathon/signasset', sessioncolored.signasset);
	app.post('/hackathon/getaddressbalance', sessioncolored.getaddressbalance);
	app.post('/hackathon/gettransaction', sessioncolored.gettransaction);
	
	
	
	
	
	
    // Error handling middleware
    app.use(ErrorHandler);
}
