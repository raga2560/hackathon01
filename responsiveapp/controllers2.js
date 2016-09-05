angular.module('myapp.controllers2', [])


.controller('SellerRegistrationCtrl', function($scope, $http) {
     
	$scope.seller={
		 name : '',
		 network:'testnet' ,
		 resaddress:'',
		 selection:'',
		 sellerterms:''
	 };
	 	 
		 $scope.owners=[];
		 $scope.events=[];
	
	$scope.balance = {
		testnet:'',
		mainnet:''		
	 };
	 
	 
	 $scope.listevents = function ()
	 {
		 var obj = {
			network:'testnet' 
		 };
		 
		 
		 $http.get('/hackathon/listevents').then(function(response) {
	  
		$scope.events = response.data;
		
		
      }, function(errResponse) {
		  $scope.error= 'error creating key';
        
      
	  });
	 }
	 $scope.listevents();
	 
	 $scope.getbalance =function (network, address)
	 {
		 if(network == 'testnet'){

		 var obj = {
			address: address 
		 };
		 
	 $http.post('/hackathon/getaddressbalance', obj).then(function(response) {
	  
	 
        $scope.balance.testnet = response.data.utxos;
		var pretty = true;
		
		$scope.listtestnet = angular.toJson(response.data, pretty);
		
		
		
      }, function(errResponse) {
		  // angular.toJson(errResponse)
        console.error('Error while fetching notes');
      
	  });
		 
			 
		 }
	 
	 }
	 	 
		 
		 
		 
	 $scope.listowners = function ()
	 {
		 var obj = {
			network:'testnet' 
		 };
		 
		 
		 $http.get('/hackathon/listowners').then(function(response) {
	  
		$scope.owners = response.data;
		
		
      }, function(errResponse) {
		  $scope.error= 'error creating key';
        
      
	  });
	 }
	 $scope.listowners();
	 
	 $scope.$watch(
                    'seller.selection',
                    function handleFooChange( newValue, oldValue ) {
						if(newValue != 'undefined' && newValue != null && newValue != ' '){
							var res = newValue.split('-');
							
							var count = res[0];
							if(isNaN(count) == false && count > 0)
							  $scope.seller.sellerterms = $scope.events[count].sellerterms;
						}
						
						
						
                    }
                );
				
	 $scope.createseller = function ()
	 {
		 $scope.error= '';
	
		if($scope.seller.name == '' || $scope.seller.resaddress == '' )
		{
			$scope.error= 'Enter data in fields';
			return;
		}
		 
		 $http.post('/hackathon/createseller', $scope.seller).then(function(response) {
	  
		//$scope.testnet = response.data.testnet;
		$scope.seller = {};
		
		
      }, function(errResponse) {
		  $scope.error= 'error';
        
      
	  });
	 }
	 
   })

   .controller('BuyerRegistrationCtrl', function($scope, $http) {
     
	$scope.buyer={
		 name : '',
		 network:'testnet' ,
		 resaddress:'',
		 selection:'',
		 buyerterms:''
	 };
	 	 
		 $scope.events=[];
	 $scope.listevents = function ()
	 {
		 var obj = {
			network:'testnet' 
		 };
		 
		 
		 $http.get('/hackathon/listevents').then(function(response) {
	  
		$scope.events = response.data;
		
		
      }, function(errResponse) {
		  $scope.error= 'error creating key';
        
      
	  });
	 }
	 $scope.listevents();
	 
	 $scope.$watch(
                    'buyer.selection',
                    function handleFooChange( newValue, oldValue ) {
						if(newValue != 'undefined' && newValue != null && newValue != ' '){
							var res = newValue.split('-');
							
							var count = res[0];
							if(isNaN(count) == false && count > 0)
							$scope.buyer.buyerterms = $scope.events[count].buyerterms;
						}
						
						
						
                    }
                );
	 
	 
	 $scope.createbuyer = function ()
	 {
		 $scope.error= '';
	
		if($scope.buyer.name == '' || $scope.buyer.resaddress == '' )
		{
			$scope.error= 'Enter data in fields';
			return;
		}
		 
		 $http.post('/hackathon/createbuyer', $scope.buyer).then(function(response) {
	  
		//$scope.testnet = response.data.testnet;
		$scope.buyer = {};
		
		
      }, function(errResponse) {
		  $scope.error= 'error';
        
      
	  });
	 }
	 
   })

    .controller('AssetRegistrationCtrl', function($scope, $http) {
		
		$scope.assets = [];
		
		$scope.asset = {
			network:'testnet',
			title: '',
			assetnumber: '',
			description:'',
			ownerid: '',
			ownername:''
		};
		 $scope.owners=[];
		 
		 $scope.owner = {
			 id: '',
			 selection:'',
			 network:'',
			 ownername:''
		 };
		 
	 $scope.listowners = function ()
	 {
		 var obj = {
			network:'testnet' 
		 };
		 
		 
		 $http.get('/hackathon/listowners').then(function(response) {
	  
		$scope.owners = response.data;
		
		
      }, function(errResponse) {
		  $scope.error= 'error creating key';
        
      
	  });
	 }
	 $scope.listowners();
	 
	 $scope.$watch(
                    'owner.selection',
                    function handleFooChange( newValue, oldValue ) {
						if(newValue != 'undefined' && newValue != null && newValue != ' '){
							var res = newValue.split('-');
							
							var count = res[0];
							if(isNaN(count) == false && count >= 0 && $scope.owners[count] != null){
							$scope.owner.id = $scope.owners[count]._id;
								$scope.owner.ownername = $scope.owners[count].record.name;
						
							}
							
						}
						
						
						
                    }
                );
	 
      
$scope.createasset = function ()
	 {
		 $scope.error= '';
	
	$scope.asset.ownerid = $scope.owner.id;
	$scope.asset.ownername = $scope.owner.ownername;
	
		if($scope.asset.title == '' || $scope.asset.assetnumber == '' || $scope.asset.ownerid == '')
		{
			$scope.error= 'Enter data in fields';
			return;
		}
		 
		 
		 $http.post('/hackathon/createasset', $scope.asset).then(function(response) {
	  
		
		$scope.asset = {};
		
		
      }, function(errResponse) {
		  $scope.error= 'error';
        
      
	  });
	 }	

   $scope.getuserassets = function ()
	 {
		 var obj = {
			network:'testnet' 
		 };
		 
		 $http.post('/hackathon/gettestnetassets', obj).then(function(response) {
		
		$scope.assets = response.data;
		
      }, function(errResponse) {
		  $scope.error= 'error getting key';
        
      
	  });
	 }	 
	 
	 $scope.getuserassets();
	 
	 function update_transaction(obj, retdata)
	 {
		 var data ={
			 assetId: obj.assetId,
			 txid : retdata.txid
		 } ;
		 $http.post('/hackathon/updatetx', data).then(function(response) {
		
		
		
      }, function(errResponse) {
		  $scope.error= 'error getting key';
        
      
	  });
	  
	 }
	 
	 $scope.commitasset = function (obj)
	 {
		
		 
		 $http.post('/hackathon/signasset', obj).then(function(response) {
		
		// update_transaction(obj, response.data);
		//$scope.assets = response.data;
		
      }, function(errResponse) {
		  $scope.error= 'error getting key';
        
      
	  });
	 }
	 
	 
	 
   })
   
 .controller('EventRegistrationCtrl', function($scope, $http) {
	 
	 
	
	 
	 $scope.username= '';
	 $scope.address= '';
	 $scope.publickey= '';
	 $scope.privatekey= '';
	 
	 $scope.event={
		 title : '',
		 network:'testnet' ,
		 description:'',
		 buyerterms:'',
		 sellerterms:''
	 };
	 
	 
	 $scope.createevent = function ()
	 {
		 $scope.error= '';
	
		if($scope.event.title == '' || $scope.event.description == '')
		{
			$scope.error= 'Enter data in fields';
			return;
		}
		 
		 $http.post('/hackathon/createevent', $scope.event).then(function(response) {
	  
		//$scope.testnet = response.data.testnet;
		$scope.event = {};
		
		
      }, function(errResponse) {
		  $scope.error= 'error';
        
      
	  });
	 }
	 
	 $scope.listevents = function ()
	 {
		 var obj = {
			network:'testnet' 
		 };
		 
		 $http.get('/hackathon/listevents').then(function(response) {
	  
		$scope.events = response.data;
		
		
      }, function(errResponse) {
		  $scope.error= 'error creating key';
        
      
	  });
	 }
	 
       
   })
   
   
   
 .controller('SellerAssetCtrl', function($scope, $stateParams) {
       
   })
 
.controller('BuyerAssetCtrl', function($scope, $stateParams) {
       
   }) 
   
  
  .controller('GovtEventCtrl', function($scope, $stateParams) {
       
   })
   

     
;
   
	
