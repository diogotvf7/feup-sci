'use strict';

angular.module('JSONedit', [])
.directive('ngModelOnblur', function() {
    // override the default input to update on blur
    // from http://jsfiddle.net/cn8VF/
    return {
        restrict: 'A',
        require: 'ngModel',
        link: function(scope, elm, attr, ngModelCtrl) {
            if (attr.type === 'radio' || attr.type === 'checkbox') return;
            
            elm.unbind('input').unbind('keydown').unbind('change');
            elm.bind('blur', function() {
                scope.$apply(function() {
                    ngModelCtrl.$setViewValue(elm.val());
                });         
            });
        }
    };
})
.directive('json', ["$compile", function($compile) {
  return {
    restrict: 'E',
    scope: {
      child: '=',
      type: '@',
      defaultCollapsed: '='
    },
    link: function(scope, element, attributes) {
        var heading = "Add";
        var objectName = "Object";
        var constantName = "constant";
        var arrayName = "Array";
        var variableName = "System variables";
        var randomName = "Random";
        var rangefrom = "Range";
        var rangeto = "Rangeto";
        var linearfrom = "Linear";
        var linearto = "Linearto";

        var client_uptime = "$Client_uptime";
        var current_time = "$Current_time";
        var client_id = "$Client_ID";
        
        
        scope.clientTypes = [client_uptime, current_time, client_id];
        
        scope.valueTypes = [arrayName, objectName, constantName, variableName, randomName, rangefrom, linearfrom];
        if (scope.$parent.defaultCollapsed === undefined) {
            scope.collapsed = false;
        } else {
            scope.collapsed = scope.defaultCollapsed;
        }
        if (scope.collapsed) {
            scope.chevron = "glyphicon-chevron-right";
        } else {
            scope.chevron = "glyphicon-chevron-down";
        }
        

        //////
        // Helper functions
        //////

        var getType = function(obj) {
            var type = Object.prototype.toString.call(obj);
            if (type === "[object Object]") {
                return "Object";
            } else if(type === "[object Array]"){
                return "Array";
            } else if(type === "[object Boolean]"){
                return "Object";
            } else if(type === "[object Number]"){
                return "Object";
            } else {
                return "Literal";
            }
        };
        var isNumber = function(n) {
          return !isNaN(parseFloat(n)) && isFinite(n);
        };
        scope.getType = function(obj) {
            return getType(obj);
        };
        scope.toggleCollapse = function() {
            if (scope.collapsed) {
                scope.collapsed = false;
                scope.chevron = "glyphicon-chevron-down";
            } else {
                scope.collapsed = true;
                scope.chevron = "glyphicon-chevron-right";
            }
        };
        scope.moveKey = function(obj, key, newkey) {
            //moves key to newkey in obj
            if (key !== newkey) {
                obj[newkey] = obj[key];
                delete obj[key];
            }
        };
        scope.deleteKey = function(obj, key) {
            if (getType(obj) == "Object") {
        /*var swal_title,swal_text;
        var confirmed=false;
          swal_title="";
          swal_text="Network "+old_network_chosen+" will be stopped. Are you sure to proceed?";
          //delete obj[key];
              swal({   title: swal_title,   
          text: swal_text,   
          //type: "warning",   
          width:300,
          height:300,
          showCancelButton: true,   
          confirmButtonColor: "#DD6B55",   
          confirmButtonText: "Yes",   
          cancelButtonText: "Cancel",   
          closeOnConfirm: true,   
          closeOnCancel: true }, 
          function(isConfirm){   
              if (isConfirm) 
              {   
                alert('a');
                confirmed=true;
                //delete obj[key];
                alert('b');
              } 
              });
              alert(confirmed);
               if (confirmed==true) */
                delete obj[key];
               /* if( 
                    swal('Deleted "'+key+'" and all its content', {
                        button: "OK",
                    })
                ) {
                    
                }*/
            } else if (getType(obj) == "Array") {
                if( confirm('Delete "'+obj[key]+'"?') ) {
                    obj.splice(key, 1);
                }
            } else {
                console.error("object to delete from was " + obj);
            }
        };
        scope.addItem = function(obj) {
            if (getType(obj) == "Object") {
                // check input for key
                if (scope.keyName == undefined || scope.keyName.length == 0){
                    swal('',"Key can't be blank");
                }else {
                    if (obj[scope.keyName]) {
                        if( swal('','An item with the name "'+scope.keyName
                            +'" exists already. New item is replaced.') ) {
                            //return;
                            delete obj[scope.keyName];
                        }
                    }
                    // add item to object
                    switch(scope.valueType) {

                        case constantName: //obj[scope.keyName] = {"type":"constant","value":scope.valueName};
                                            obj[scope.keyName] = scope.valueName+"-CONSTANT";
                                        break;
                        case variableName:  //obj[scope.keyName] = {"type":"systemvariable","value":scope.clientType}; 
                                            obj[scope.keyName] = scope.clientType+"-SYSTEMVARIABLE"; 
                                            break;
                        case arrayName:
                                            obj[scope.keyName] = [];
                                        break;
                        case randomName:   obj[scope.keyName] = scope.valueName+"-RANDOM";
                                        break;
                        case rangefrom: 
                                        if (scope.valueName > scope.rangetovalue)
                                            obj[scope.keyName] = scope.rangetovalue +'-'+scope.valueName+"-RANGE";
                                        else
                                            obj[scope.keyName] = scope.valueName +'-'+ scope.rangetovalue+"-RANGE";
                                        break;
                        case linearfrom:if (parseInt(scope.valueName) > parseInt(scope.rangetovalue)) 
                                            obj[scope.keyName] = scope.valueName +'-'+ scope.rangetovalue+"-DECREMENT";
                                        else
                                            obj[scope.keyName] = scope.valueName +'-'+ scope.rangetovalue+"-INCREMENT";
                                        break;

                        case objectName:  obj[scope.keyName] = {};
                                        break;
                    }
                    //clean-up
                    scope.keyName = "";
                    scope.valueName = "";
                    //scope.arrayName = "";

                    scope.rangetovalue = "";
                    scope.showAddKey = false;
                }
            } else if (getType(obj) == "Object") {
                switch(scope.valueType) {
                    case constantName: obj.push(scope.valueName+"-CONSTANT");
                                    break;
                    case variableName:  obj.push(scope.clientType+"-SYSTEMVARIABLE");
                                    break;
                      case arrayName:
                                       obj.push([]);
                                    break;
                    case randomName:   obj.push(scope.valueName+"-RANDOM");
                                    break;
                    case linearfrom: if (parseInt(scope.valueName) > parseInt(scope.rangetovalue)) 
                                        obj.push( scope.valueName +'-'+ scope.rangetovalue+"-DECREMENT");
                                    else
                                        obj.push(scope.valueName +'-'+ scope.rangetovalue+"-INCREMENT");
                                    break;
                    case rangefrom:
                                    if (scope.valueName>scope.rangetovalue)
                                        obj.push(scope.rangetovalue+'-'+scope.valueName +"-RANGE");
                                    else
                                        obj.push(scope.valueName +'-'+ scope.rangetovalue+"-RANGE");
                                    break;
                    case objectName:  obj.push({});
                                    break;
                }
                scope.valueName = "";
                scope.arrayName = "";
                scope.showAddKey = false;
            }
               else if (getType(obj) == "Array") {
                switch(scope.valueType) {
                    
                    case constantName: obj.push(scope.valueName+"-CONSTANT");
                                    break;
                    case variableName:  obj.push(scope.clientType+"-SYSTEMVARIABLE");
                                    break;
                    case arrayName:
                                       obj.push([]);
                                    break;
                    case randomName:   obj.push(scope.valueName+"-RANDOM");
                                    break;
                    case linearfrom: if (parseInt(scope.valueName) > parseInt(scope.rangetovalue)) 
                                        obj.push( scope.valueName +'-'+ scope.rangetovalue+"-DECREMENT");
                                    else
                                        obj.push(scope.valueName +'-'+ scope.rangetovalue+"-INCREMENT");
                                    break;
                    case rangefrom:
                                    if (scope.valueName>scope.rangetovalue)
                                        obj.push(scope.rangetovalue+'-'+scope.valueName +"-RANGE");
                                    else
                                        obj.push(scope.valueName +'-'+ scope.rangetovalue+"-RANGE");
                                    break;
                    case objectName:  obj.push({});
                                    break;
                }
                scope.valueName = "";
                //scope.arrayName = "";
                scope.showAddKey = false;
            }

             else {
                console.error("object to add to was " + obj);
            }
        };
        scope.possibleNumber = function(val) {
            return isNumber(val) ? parseFloat(val) : val;
        };

        //////
        // Template Generation
        //////

        // Note:
        // sometimes having a different ng-model and then saving it on ng-change
        // into the object or array is necessary for all updates to work
        
        // recursion
        var switchTemplate = 
            '<span ng-switch on="getType(val)" >'
                + '<json ng-switch-when="Object" child="val" type="object" default-collapsed="defaultCollapsed"></json>'
                + '<json ng-switch-when="Array" child="val" type="array" default-collapsed="defaultCollapsed"></json>'
                + '<span ng-switch-when="Boolean" type="boolean">'
                    + '<input type="checkbox" ng-model="val" ng-model-onblur ng-change="child[key] = val">'
                + '</span>'
                + '<span ng-switch-when="Number" type="number"><input type="text" ng-model="val" '
                    + 'placeholder="0" ng-model-onblur ng-change="child[key] = possibleNumber(val)"/>'
                + '</span>'
                + '<span ng-switch-default class="jsonLiteral"><input type="text" ng-model="val" '
                    + 'placeholder="Empty" ng-model-onblur ng-change="child[key] = val"/>'
                + '</span>'
            + '</span>';
        
        // display either "plus button" or "key-value inputs"
        var addItemTemplate = 
        '<div ng-switch on="showAddKey" class="block" >'
            + '<span ng-switch-when="true">';
                if (scope.type == "object"){
                   // input key
                    addItemTemplate += '<input placeholder="Key" type="text" ui-keyup="{\'enter\':\'addItem(child)\'}" '
                        + 'class="form-control input-sm addItemKeyInput" ng-model="$parent.keyName" /> ';
                }
                else if (scope.type == "array"){
                    // addItemTemplate += '<input placeholder="Key" type="text" ui-keyup="{\'enter\':\'addItem(child)\'}" '
                    //     + 'class="form-control input-sm addItemKeyInput" ng-model="$parent.keyName" /> ';
                }
                addItemTemplate += 
                // value type dropdown
                
                '<select ng-model="$parent.valueType" ng-options="option for option in valueTypes" class="form-control input-sm"'
                    + 'ng-init="$parent.valueType=\''+constantName+'\'" ui-keydown="{\'enter\':\'addItem(child)\'}"></select>'
                // input value
                + '<span ng-show="$parent.valueType == \''+constantName+'\'"> : <input type="text" name="constantvalue" placeholder="constant" '
                    + 'class="form-control input-sm addItemValueInput" ng-model="$parent.valueName" ng-value="constantvalue" ui-keyup="{\'enter\':\'addItem(child)\'}"/></span> '
                + '<span ng-show="$parent.valueType == \''+variableName+'\'"> : <select ng-model="$parent.clientType" ng-options="option for option in clientTypes" class="form-control input-sm"'
                    + 'ng-init="$parent.clientType=\''+client_uptime+'\'" ui-keydown="{\'enter\':\'addItem(child)\'}"></select></span>'
                + '<span ng-show="$parent.valueType == \''+randomName+'\'"> : <input type="text"  placeholder="On|Off" '
                    + 'class="form-control input-sm addItemValueInput" ng-model="$parent.valueName" ui-keyup="{\'enter\':\'addItem(child)\'}"/></span>  '
                + '<span ng-show="$parent.valueType == \''+rangefrom+'\'"> : <input type="number" '
                    + 'class="form-control json-input-range input-sm addItemValueInput" ng-model="$parent.valueName" ui-keyup="{\'enter\':\'addItem(child)\'}"/> to <input type="number"  ng-model="$parent.rangetovalue" '
                    + 'class="form-control json-input-range input-sm addItemValueInput" ui-keyup="{\'enter\':\'addItem(child)\'}"/>   </span> '
                + '<span ng-show="$parent.valueType == \''+linearfrom+'\'"> : <input type="number" '
                    + 'class="form-control json-input-range input-sm addItemValueInput" ng-model="$parent.valueName" ui-keyup="{\'enter\':\'addItem(child)\'}"/> to <input type="number" ng-model="$parent.rangetovalue" '
                    + 'class="form-control json-input-range input-sm addItemValueInput" ui-keyup="{\'enter\':\'addItem(child)\'}"/>   </span> '

                
                // Add button
                + '<button type="button" class="btn btn-primary btn-sm" id="btn-addkey" ng-click="addItem(child)">Add</button> '
                + '<button type="button" class="btn btn-default btn-sm" ng-click="$parent.showAddKey=false">Cancel</button>'
            + '</span>'
            + '<span ng-switch-default>'
                // plus button
                + '<button type="button" class="addObjectItemBtn" ng-click="$parent.showAddKey = true"><i class="glyphicon glyphicon-plus"></i></button>'
            + '</span>'
        + '</div>';
    
        // start template
        if (scope.type == "object"){
            var template = '<i ng-click="toggleCollapse()" class="glyphicon" ng-class="chevron"></i>'
            + '<span class="jsonItemDesc">'+objectName+'</span>'
            + '<div class="jsonContents" ng-hide="collapsed">'
                // repeat
                + '<span class="block" ng-hide="key.indexOf(\'_\') == 0" ng-repeat="(key, val) in child">'
                    // object key
                    + '<span class="jsonObjectKey">'
                        + '<input class="keyinput" type="text" ng-model="newkey" ng-init="newkey=key" '
                            + 'ng-blur="moveKey(child, key, newkey)"/>'
                        // delete button
                        + '<i class="deleteKeyBtn glyphicon glyphicon-trash" ng-click="deleteKey(child, key)"></i>'
                    + '</span>'
                    // object value
                    + '<span class="jsonObjectValue">' + switchTemplate + '</span>'
                + '</span>'
                // repeat end
                + addItemTemplate
            + '</div>';
        } else if (scope.type == "object") {
            var template = '<i ng-click="toggleCollapse()" class="glyphicon"'
            + 'ng-class="chevron"></i>'
            + '<span class="jsonItemDesc">'+objectName+'</span>'
            + '<div class="jsonContents" ng-hide="collapsed">'
                + '<ol class="arrayOl" ng-model="child">'
                    // repeat
                    + '<li class="arrayItem" ng-repeat="(key, val) in child track by $index">'
                        // delete button
                        + '<i class="deleteKeyBtn glyphicon glyphicon-trash" ng-click="deleteKey(child, $index)"></i>'
                        + '<span>' + switchTemplate + '</span>'
                    + '</li>'
                    // repeat end
                + '</ol>'
                + addItemTemplate
            + '</div>';
        }


        else if (scope.type == "array"){
            var template = '<i ng-click="toggleCollapse()" class="glyphicon" ng-class="chevron"></i>'
            + '<span class="jsonItemDesc">'+arrayName+'</span>'
            + '<div class="jsonContents" ng-hide="collapsed">'
                // repeat
                + '<span class="block" ng-hide="key.indexOf(\'_\') == 0" ng-repeat="(key, val) in child">'
                    // object key
                    + '<span class="jsonArrayKey">'
                        + '<input class="keyinput" type="text" ng-model="newkey" ng-init="newkey=key" '
                            + 'ng-blur="moveKey(child, key, newkey)"/>'
                               
                        // delete button
                        + '<i class="deleteKeyBtn glyphicon glyphicon-trash" ng-click="deleteKey(child, key)"></i>'
                    + '</span>'
                    // array value
                    + '<span class="jsonArrayValue">' + switchTemplate + '</span>'
                + '</span>'
                // repeat end
                + addItemTemplate
            + '</div>';
        } else if (scope.type == "array") {
            var template = '<i ng-click="toggleCollapse()" class="glyphicon"'
            + 'ng-class="chevron"></i>'
            + '<span class="jsonItemDesc">'+arrayName+'</span>'
            + '<div class="jsonContents" ng-hide="collapsed">'
                + '<ol class="arrayOl" ng-model="child">'
                    // repeat
                    + '<li class="arrayItem" ng-repeat="(key, val) in child track by $index">'
                        // delete button
                        + '<i class="deleteKeyBtn glyphicon glyphicon-trash" ng-click="deleteKey(child, $index)"></i>'
                        + '<span>' + switchTemplate + '</span>'
                    + '</li>'
                    // repeat end
                + '</ol>'
                + addItemTemplate
            + '</div>';
        }  
        else {
            console.error("scope.type was "+ scope.type);
        }

        var newElement = angular.element(template);
        $compile(newElement)(scope);
        element.replaceWith ( newElement );
    }
  };
}]);
