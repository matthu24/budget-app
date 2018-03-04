//budget controller
//IIFE immediately invoked anonoymous function
var budgetController = (function() {
  //function constructor
  var Expense = function(id, description,value){
    this.id = id;
    this.description = description;
    this.value = value;
    this.percentage = -1;
  }

  //add a method that will calculate the percentage for each item object
  Expense.prototype.calcPercentage = function(totalIncome){
    if(totalIncome > 0){
      this.percentage = Math.round(this.value/totalIncome * 100);

    }else{
      this.percentage = -1;
    }
  }

  Expense.prototype.getPercentage = function(){
    return this.percentage;
  }

  var Income = function(id, description,value){
    this.id = id;
    this.description = description;
    this.value = value;
  }




  var data = {
    //for the the list at the bottom of the app
    allItems: {

      exp: [],
      inc: []
    },
    //for the green and red boxes at the top of the app
    totals: {
      exp:0,
      inc:0
    }
  }

  return {
    //different names to avoid confusion for description and value
    addItem: function(type,des,val){
      var newItem;
      //grab last element of allItems of the specific type, get the id of that, and add one for the new id
      if(data.allItems[type].length){
        var ID = data.allItems[type][data.allItems[type].length-1].id + 1;

      }else{
        var ID = 0;
      }

      if(type === 'exp'){
        newItem = new Expense(ID,des,val)
      }else if (type === 'inc'){
        newItem = new Income(ID,des,val);
      }
      //add newItem to allItems, we need to distinguish if it's an exp or an inc
      data.allItems[type].push(newItem);
      data.totals[type] += parseFloat(newItem.value);
      //so that module that calls addItem can have access to newItem
      return newItem;


    },
    deleteItem: function(type,id){
      //id = 3
      var ids, index, deletedNode;
      //get array of ids because they won't be in order (because we can delete items)
      ids = data.allItems[type].map(current => {
        return current.id;
      })

      index = ids.indexOf(id);

      // indexOf returns -1 if id is non existant
      if(index !== -1){
        deletedNode = data.allItems[type].splice(index,1);
      }
      data.totals[type] -= deletedNode[0].value;
    },

    calculateBudget: function(){
      //calculate total income and expenses
      //calculate budget: income-expenses
      let budget,totalPercentage;
      budget = data.totals.inc-data.totals.exp;
      //calculate percentage of income that we spent
      totalPercentage = data.totals.exp / data.totals.inc;
      return {
        budget: budget,
        totalPercentage: totalPercentage,
        income: data.totals.inc,
        expenses: data.totals.exp
      }
    },
    //loop thru all items
    calculatePercentages: function(){
      data.allItems.exp.forEach(el => {
        el.calcPercentage(data.totals.inc);
      })
    },
    //returns an array of all the percentages of all the expenses
    getPercentages: function(){
      var allPercentages = data.allItems.exp.map(el => {
        return el.getPercentage();
      });
      return allPercentages;
    },
    testing: function (){
      console.log(data);
    }
  }

})();

//UI controller
//1. reads input values
var UIController = (function(){
  //public method needs to be accessed by other controller, so need to put it in the return
  //private methods do not get put in this return
  //this is the power of iife

  //for simplicity: if we want to change the class names in the html, we just have to come to this 'library' to change it
  var DOMStrings = {
    inputType: '.add__type',
    inputDescription: '.add__description',
    inputValue: '.add__value',
    inputBtn: '.add__btn',
    incomeContainer: '.income__list',
    expenseContainer: '.expenses__list',
    budgetValue: '.budget__value',
    incomeValue: '.budget__income--value',
    expensesValue: '.budget__expenses--value',
    month: '.budget__title--month',
    totalPercentage: '.budget__expenses--percentage',
    container: '.container',
    expensesPercentageLabel: '.item__percentage'

  }

  return {
    updateMonth: function(){
      let months = ["January",'February','March','April','May','June','July','August','September','October','November','December']
      let element = DOMStrings.month;
      let date = new Date();
      let year = date.getFullYear();

      document.querySelector(element).innerText = months[date.getMonth()] + ' ' + year;
    },
    getInput: function(){
      return {
        //the value for type is either 'inc' or 'exp' see index.html line 44,45
        type: document.querySelector(DOMStrings.inputType).value, //whatever the user types in type input field
        description: document.querySelector(DOMStrings.inputDescription).value,
        value: parseFloat(document.querySelector(DOMStrings.inputValue).value)
      };
    },
    //the obj is the same as the newItem object that is returned from budgetCtrl.addItem
    addListItem: function(obj,type,budget){
      let html, newHTML, element;//html element;
      //create html string with placeholder text
      //replace placeholder text with some actual data
      if(type === 'inc'){
      element = DOMStrings.incomeContainer;
      html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
     }else{
       element = DOMStrings.expenseContainer;
       html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">%p%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
     }
     //replace replaces first argument with second argument and returns the whole new string
     newHTML = html.replace('%id%',obj.id);
     newHTML = newHTML.replace('%description%',obj.description);
     newHTML = newHTML.replace('%value%',obj.value);

     //insert html strings into dom
     //insertAdjacentHTML beforeend keyword means that we are inserting the html as a child element after the last existing child element
     document.querySelector(element).insertAdjacentHTML('beforeend',newHTML);

    },
    deleteListItem: function(selectorId){
      //use removeChild method, for this we need the direct parent element
      let child = document.getElementById(selectorId);
      child.parentNode.removeChild(child);
    },
    updateUIBudget: function(budget){
      let budgetElement, incomeElement, expensesElement;
      budgetElement = DOMStrings.budgetValue;
      incomeElement = DOMStrings.incomeValue;
      expensesElement = DOMStrings.expensesValue;
      percentageElement = DOMStrings.totalPercentage;
      let totalPercentage = (budget.expenses / budget.income);

      document.querySelector(budgetElement).innerHTML = budget.budget > 0 ? "+ " + budget.budget.toFixed(2) : budget.budget.toFixed(2);
      document.querySelector(incomeElement).innerHTML = budget.income.toFixed(2);
      document.querySelector(expensesElement).innerHTML = '-' + budget.expenses.toFixed(2);
      document.querySelector(percentageElement).innerHTML = Math.round(totalPercentage * 100) + "%";
    },

    //expose domstrings into public
    getDOMStrings: function(){
      return DOMStrings;
    },
    clearFields: function(){
      //querySelectorAll returns a node list not an array ... each node has a value attribute that we can access
      let fields = document.querySelectorAll(DOMStrings.inputDescription + ',' + DOMStrings.inputValue);
      //convert list to array:
      let fieldsArray = Array.prototype.slice.call(fields);
      //index and array are optional arguments that forEach can take, don't necesasarily need them
      fieldsArray.forEach((current,index,array) => {
        current.value = "";
      })
      fieldsArray[0].focus();
    },
    displayPercentages: function(percentages){
      //fields is a nodeList
      var fields = document.querySelectorAll(DOMStrings.expensesPercentageLabel);
      var myForEach = function(list,cb){
        for(let i=0;i< list.length;i++){
          cb(list[i],i);
        }
      }
      myForEach(fields,function(current,index){
        current.textContent = percentages[index] + '%'
      })
    }
  }
})();


//global app controller
//takes in two arguments, we pass in the budgetController and the UI controller from above
var controller = (function(budgetCtrl,UICtrl){

  //fcn to setup all event listeners
  var setupEventListeners = function(){
    var DOM = UICtrl.getDOMStrings();
    //we want a click event on the green button, but also a key event on enter
    document.querySelector(DOM.inputBtn).addEventListener('click',controlAddItem)

    document.addEventListener('keypress',function(e){
      //e is an object that has a keyCode property, the enter key has a keycode of 13
      if(e.keyCode === 13){
        controlAddItem();
      }
    })

    //all income and expenses list items are contained in common parent class "container"
    // we will put event handler on this parent class bc of event delegation
    document.querySelector(DOM.container).addEventListener('click',ctrlDeleteItem);
  };

  var controlAddItem = function (){
    //as soon as someone hits the button, 1. get input data
    var input = UICtrl.getInput();
    //validations for the input
    if(input.description !== "" && !isNaN(input.value) && input.value > 0){
      //2. add item to budget controller
      var newItem = budgetCtrl.addItem(input.type, input.description, input.value);

      //3. calculate the budget
      var budget = budgetCtrl.calculateBudget();
      //budget is now the budget object returned from budgetController
      UICtrl.updateUIBudget(budget);

      //4. add new item to UI as well
      UICtrl.addListItem(newItem,input.type,budget)
      UICtrl.clearFields();
      //5. display budget
      updatePercentages();

    }


  };

  var ctrlDeleteItem = e => {
    var itemID = (e.target.parentNode.parentNode.parentNode.parentNode.id);
    if(itemID){
      var splitID = itemID.split('-');
      var type = splitID[0];
      var ID = parseInt(splitID[1]);

      //delete item
      budgetCtrl.deleteItem(type,ID);
      UICtrl.deleteListItem(itemID);
      var budget = budgetCtrl.calculateBudget();
      console.log(budget);
      //budget is now the budget object returned from budgetController
      UICtrl.updateUIBudget(budget);

      //delete item from UI
      //update and show the new budget


      updatePercentages();
    }
  }

  var updatePercentages = () => {
    //calculate percentages
    budgetCtrl.calculatePercentages();
    //read them from budget controller
    var percentages = budgetCtrl.getPercentages();
    // console.log(percentages);

    //update UI with new percentages
    //just need to go thru each expense item in dom and replace
    UICtrl.displayPercentages(percentages);

  }

  return{
    init:function(){
      console.log('app has started')
      setupEventListeners();
      UICtrl.updateMonth();
    }
  }



})(budgetController,UIController);

controller.init();
