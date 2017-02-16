// CREATING DIFFERENT MODULES FOR THE PAGE -- separation of concerns

// using an IIFE is best for data privacy because it creates a new scope not visible tfrom the outside scope
// because of closures, the inner functions have acces to the variables and parameters of the outer function even after its returned
// anything in the return object will be public -- anything inside the return object will have access to the outer scope

// DATA MODULE -- all data needed to determine calculations and data structure
var budgetController = (function(){

	var Expense = function(id, description, value){
		this.id = id;
		this.description = description;
		this.value = value;
		this.percentage = -1;
	}

	Expense.prototype.calculatePercentage = function(totalIncome){
		if(totalIncome > 0){
			this.percentage = Math.round((this.value / totalIncome) * 100);
		} else {
			this.percentage = -1;
		}
	};

	Expense.prototype.getPercentage = function(){
		return this.percentage;
	};

	var Income = function(id, description, value){
		this.id = id;
		this.description = description;
		this.value = value;
	}

	var calculateTotal = function(type){
		var sum = 0;
		budgetData.allItems[type].forEach(function(current){
			sum += current.value;
		});
		budgetData.totals[type] = sum;
	}

	var budgetData = {
		allItems: {
			income: [],
			expense: []
		},
		totals: {
			income: 0,
			expense: 0
		},
		budget: 0,
		percentage: -1
	}

	return {
		addItem: function(type, des, val){
			var newItem, ID;

			// create new ID here by using the length of the array in budgetData -- add 1 to get a new ID#
			if(budgetData.allItems[type].length > 0){
				ID = budgetData.allItems[type][budgetData.allItems[type].length - 1].id + 1;
			} else {
				ID = 1;
			}

			// create new item and add it to the budgetData object bases on whether its an expense or income
			if(type === "income"){
				newItem = new Income(ID, des, val);
			} else {
				newItem = new Expense(ID, des, val);
			}
			// push new item to data structure
			budgetData.allItems[type].push(newItem);
			// return the item for later use
			return newItem;
		},
		deleteItem: function(type, id){
			var ids, index;
			ids = budgetData.allItems[type].map(function(current){
				return current.id;
			});
			index = ids.indexOf(id);
			if(index !== -1){
				budgetData.allItems[type].splice(index, 1);
			}
		},
		calculateBudget: function(){
			// calculate the total income and expenses
			calculateTotal('income');
			calculateTotal('expense');
			// calculate the budget: income - expenses
			budgetData.budget = budgetData.totals.income - budgetData.totals.expense;
			// calculate percentage of income that we spent
			if(budgetData.totals.income > 0){
				budgetData.percentage = Math.round((budgetData.totals.expense / budgetData.totals.income) * 100);
			} else {
				budgetData.percentage = -1;
			}
		},
		calculatePercentages: function(){
			budgetData.allItems.expense.forEach(function(el){
				el.calculatePercentage(budgetData.totals.income);
			});
		},
		getPercentages: function(){
			var allPercentages;
			allPercentages = budgetData.allItems.expense.map(function(el){
				return el.getPercentage();
			});
			return allPercentages;
		},
		getBudget: function(){
			return {
				budget: budgetData.budget,
				totalIncome: budgetData.totals.income,
				totalExpense: budgetData.totals.expense,
				percentage: budgetData.percentage
			}
		},
		testing: function(){
			console.log(budgetData);
		}
	};

})();

// UI MODULE -- all data needed to display on the UI
var UIController = (function(){

	var DOMelements = {
		inputType: '.add-type',
		inputDescription: '.add-description',
		inputValue: '.add-value',
		inputBtn: '.add-btn',
		incomeContainer: '.income-list',
		expenseContainer: '.expense-list',
		budgetValue: '.budget-value',
		incomeValue: '.budget-income-value',
		expenseValue: '.budget-expense-value',
		percentageValue: '.budget-expense-percentage',
		container: '.container',
		expensesPercentageTag: '.item-percentage',
		dateLabel: '.budget-title-month'
	};

    var formatNumber = function(num, type) {
        var numSplit, integer, decimal, type;
        num = Math.abs(num);
        num = num.toFixed(2);
        numSplit = num.split('.');
        integer = numSplit[0];
        if (integer.length > 3) {
            integer = integer.substr(0, integer.length - 3) + ',' + integer.substr(integer.length - 3, 3);
        }
        decimal = numSplit[1];
        return (type === 'income' ? '+' : '-') + ' ' + integer + '.' + decimal;
    };

	var formatInput = function(num, type){
		var numberSplit, integer, decimal, type;
		// + or - before the number -- exactly 2 decimal points
		number = Math.abs(num);
		number = num.toFixed(2);
		numberSplit = number.split('.');
		integer = numberSplit[0];
		if(integer.length > 3){
			integer = integer.substr(0, integer.length - 3) + ',' + integer.substr(integer.length - 3, 3);
		}
		decimal = numberSplit[1];
		return (type === 'income' ? '+' : '-') + ' ' + integer + '.' + decimal;
	}

	var nodeListForEach = function(list, callback){
		for(var i = 0; i < list.length; i++){
			callback(list[i], i);
		}
	};

		return {
			getUserInput(){
				return {
					type: document.querySelector(DOMelements.inputType).value, // value for either increasing of expensing
					description: document.querySelector(DOMelements.inputDescription).value, // users input for the description
					value: parseFloat(document.querySelector(DOMelements.inputValue).value) // whatever the numerical value is
				};
			},
			addItemToUI: function(obj, type){
				var html, newHtml, elementToAttachList;
				// create HTML string with placeholder text
				if(type === "income"){
					elementToAttachList = DOMelements.incomeContainer;
					html = '<div class="item clearfix" id="income-%id%"> <div class="item-description">%description%</div> <div class="right clearfix"> <div class="item-value">%value%</div> <div class="item-delete"> <button class="item-delete-btn"><i class="ion-ios-close-outline"></i></button> </div> </div> </div>'
				} else {
					elementToAttachList = DOMelements.expenseContainer;
					html = '<div class="item clearfix" id="expense-%id%"> <div class="item-description">%description%</div> <div class="right clearfix"> <div class="item-value">%value%</div> <div class="item-percentage">10%</div> <div class="item-delete"> <button class="item-delete-btn"><i class="ion-ios-close-outline"></i></button> </div> </div> </div>'
				}
				// replace the placeholder text with actual data
				newHtml = html.replace('%id%', obj.id);
				newHtml = newHtml.replace('%description%', obj.description);
				newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));
				// insert HTML into DOM
				document.querySelector(elementToAttachList).insertAdjacentHTML('beforeend', newHtml)
			},
			deleteItemFromUI: function(itemID){
				var elementToRemove = document.getElementById(itemID);
				elementToRemove.parentNode.removeChild(elementToRemove);
			},
			clearInput: function(){
				document.querySelector(DOMelements.inputDescription).value = "";
				document.querySelector(DOMelements.inputValue).value = "";
				document.querySelector(DOMelements.inputDescription).focus();
			},
			displayBudget: function(obj){
				var type;
				obj.budget > 0 ? type = 'income' : type = 'expense';

				document.querySelector(DOMelements.budgetValue).textContent = formatNumber(obj.budget, type);
				document.querySelector(DOMelements.incomeValue).textContent = formatNumber(obj.totalIncome, 'income');
				document.querySelector(DOMelements.expenseValue).textContent = formatNumber(obj.totalExpense, 'expense');

				if(obj.percentage > 0){
					document.querySelector(DOMelements.percentageValue).textContent = obj.percentage + "%";
				} else {
					document.querySelector(DOMelements.percentageValue).textContent = "---";
				}
			},
			displayPercentages: function(percentages){
				var allExpenseTags = document.querySelectorAll(DOMelements.expensesPercentageTag);

				nodeListForEach(allExpenseTags, function(current, index){
					if(percentages[index] > 0){
						current.textContent = percentages[index] + '%';
					} else {
						current.textContent = "---";
					}
				});
			},
			displayCurrentMonth: function(){
				var currentDate, year, month, months;
				currentDate = new Date();
				year = currentDate.getFullYear();
				months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
				month = currentDate.getMonth();
				document.querySelector(DOMelements.dateLabel).textContent = months[month] + ' ' + year;
			},
			changeInputType: function(){
				var labels = document.querySelectorAll(DOMelements.inputType + ', ' + DOMelements.inputDescription + ', ' + DOMelements.inputValue);

				nodeListForEach(labels, function(current){
					current.classList.toggle('focus-red');
				});

				document.querySelector(DOMelements.inputBtn).classList.toggle('red');
			},
			getDOMelements(){
				return DOMelements;
			}
		};
})();

// CONTROLLER MODULE -- all data needed to control the app and link the UI and DATA modules
// passing the DATA and UI controllers into this IIFE allows the main controller to know about the other two controllers and can use their data
var controller = (function(budgetCtrl, UICtrl){

	function initializeEventListeners(){
		var DOM = UICtrl.getDOMelements();

		document.querySelector(DOM.inputBtn).addEventListener('click', controlAddItem);

		document.addEventListener('keydown', function(event){
			if(event.keyCode === 13 || event.which === 13){
				controlAddItem();
			}
		});

		document.querySelector(DOM.container).addEventListener('click', controlDeleteItem);

		document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changeInputType)
	};

	var updateBudget = function(){
		var budget;
		// calculate the budget
		budgetCtrl.calculateBudget();

		// return the budget
		budget = budgetCtrl.getBudget();

		// display the budget to the UI
		UICtrl.displayBudget(budget);
	};

	var updatePercentage = function(){
		var percentages;
		// calculate percentages
		budgetCtrl.calculatePercentages();

		// read percentages from budget controller
		percentages = budgetCtrl.getPercentages();

		// update the UI with new percentages
		UICtrl.displayPercentages(percentages);
	};

	var controlAddItem = function(){
		var userInput, newItem;
		// get input data from user
		userInput = UICtrl.getUserInput();

		if(userInput.description !== "" && !isNaN(userInput.value) && userInput.value > 0){
			// add item to budget controller
			newItem = budgetCtrl.addItem(userInput.type, userInput.description, userInput.value);

			// add item to UI
			UICtrl.addItemToUI(newItem, userInput.type);

			// clear input from description and value
			UICtrl.clearInput();

			// calculate and update budget
			updateBudget();

			// calculate and update percentages
			updatePercentage();
		}
	};

	var controlDeleteItem = function(event){
		var itemID, splitID, type, ID;

		itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;

		if(itemID){
			splitID = itemID.split("-");
			type = splitID[0];
			ID = parseInt(splitID[1]);

			// delete item from data structure
			budgetCtrl.deleteItem(type, ID);

			// delete item from UI
			UICtrl.deleteItemFromUI(itemID);

			// update and show new budget
			updateBudget();

			// calculate and update percentages
			updatePercentage();
		}
	}

	return {
		init: function(){
			UICtrl.displayCurrentMonth();
			UICtrl.displayBudget({
				budget: 0,
				totalIncome: 0,
				totalExpense: 0,
				percentage: 0
			});
			initializeEventListeners();
		}
	};
})(budgetController, UIController);

controller.init();









