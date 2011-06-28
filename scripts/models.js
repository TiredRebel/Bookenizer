//Models
var TopDestination = Backbone.Model.extend();
var Statistic = Backbone.Model.extend();
var SearchLocation = Backbone.Model.extend();
var Language = Backbone.Model.extend();
var Hotel = Backbone.Model.extend();
var SortOrder=Backbone.Model.extend();
var SearchCriteria = {
        language:null,
        /*cityId:null,
        dateFrom:null,
        dateTo:null,
        advDateFrom:null,
        advDateTo:null,
        numberOfPersons:null,
        lodgingTypeRoom:null,
        lodgingTypeApart:null,
        stars2:null,
        stars3:null,
        stars4:null,
        stars5:null,
        mealsFull:null,
        mealsHalf:null,
        mealsNo:null,
        pricePerNightLow:null,
        pricePerNightHigh:null,
        offset:null,
        facilities:null,*/
        searchType:"QUICK",
        limit:null,
        sortType:"NAME",
        sortDirection:"DESC"
};
var HotelCard = Backbone.Model.extend();