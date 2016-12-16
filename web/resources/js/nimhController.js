(function(){
   
   /** Controller for the whole NIMH page **/
   angular.module('researchApp').controller('nimhController',nimhController);
   nimhController.$inject = ['$scope','$rootScope','$http','nimhAPI','$window','$location'];

   function nimhController(ngScope,ngRootScope,$http,nimhAPI,window,location){

      var vm = this;
      initNIMHController();
      vm.takeBack = takeBack;
      function takeBack(){
        window.history.back();
      }
      function initNIMHController(){
         

         console.log("hello");
         nimhAPI.getNIMHData().then(function (d){

             vm.nimhData = d.data;
             //console.log(vm.nimhData);
             vm.nimhData.users = vm.nimhData.participants;
             
             console.log(vm.nimhData.users);

             vm.findAvgCompliance = function(){
               var total = 0;
               for (var i = 0; i < vm.nimhData.users.length ; i++) {
                     total+=vm.nimhData.users[i]['compliance'];
               }
               return (total/i).toFixed(2);
             }

             vm.findTotal = function(property){
               var total = 0;
               for (var i = 0; i < vm.nimhData.users.length ; i++) {
                     total+=vm.nimhData.users[i][property];
               }
               return (total);
             }
             //Colors for the graph
             vm.colors = ['#FF9655', '#adfc71', '#dd616e', '#454545', '#b3aee5', '#64E572', '#FFF263', '#66FFCC', '#51b93e'];

             //Data for the graphs in desired format
             vm.users = [];
             vm.users.daysComplete = [];
             vm.users.surveysComplete = [];
             vm.users.totalMoodChanges = [];
             vm.users.positiveMoodChanges = [];
             vm.users.negativeMoodChanges = [];
             angular.forEach(vm.nimhData.users, function(value, key) {
                  vm.users.push('USER ' + value.user);
                  vm.users.daysComplete.push(value['day-count']);
                  vm.users.surveysComplete.push(value['survey-count']);
                  vm.users.totalMoodChanges.push(value['total_mood_changes']);
                  vm.users.positiveMoodChanges.push(value['positive_changes']);
                  vm.users.negativeMoodChanges.push(value['negative_changes']);
             });
             vm.navigateToUserPage = function(userId){
              console.log(userId);
              nimhAPI.setUser(userId);
              window.location.href="user.html";
             }
             //All the graphs on this page
             vm.daysSurveysGraph = {
               options: {

                  chart: {
                         zoomType: 'xy'
                  },
                  title: {
                          text: 'Days in Study and Surveys Complete'
                  },
                  xAxis: {
                           categories: vm.users,
                           crosshair: true
                  },
                  yAxis: [{ // Primary yAxis
                     labels: {
                         format: '{value} Days',
                         style: {
                             color: vm.colors[3]
                         }
                     },
                     title: {
                         text: 'Days in Study',
                         style: {
                             color: vm.colors[3]
                         }
                     }
                  }, { // Secondary yAxis
                     title: {
                         text: 'Surveys Complete',
                         style: {
                             color: vm.colors[9]
                         }
                     },
                     labels: {
                         format: '{value} Surveys',
                         style: {
                             color: vm.colors[9]
                         }
                     },
                     opposite: true
                  }],

                  tooltip: {
                  shared: true
                  },

                  legend: {
                  layout: 'vertical',
                  align: 'left',
                  x: 120,
                  verticalAlign: 'top',
                  y: 40,
                  floating: true,
                  backgroundColor: '#FFFFFF'
                  }
               },
               credits: {
                  enabled: false
               },
               series: [{
                  name: 'Surveys',
                  type: 'column',
                  yAxis: 1,
                  data: vm.users.surveysComplete,
                  tooltip: {
                      valueSuffix: ' surveys'
                  },
                  color: vm.colors[3]

               }, {
                  name: 'Days in Study',
                  type: 'spline',
                  data: vm.users.daysComplete,
                  tooltip: {
                      valueSuffix: ' days'
                  },
                  color: vm.colors[9]
               }]
            } //end of days-surveys graphs

            vm.moodChangesGraph ={
               options :{ 

                 chart: {
                     type: 'column'
                 },
                 title: {
                     text: 'Positive and Negative Mood Changes Across Participants'
                 },
                 xAxis: {
                     categories: vm.users
                 },
                 yAxis: {
                     allowDecimals: false,
                     min: 0,
                     title: {
                         text: 'Number of changes'
                     }
                 },
                 tooltip: {
                     formatter: function () {
                         return '<b>' + this.x + '</b><br/>' +
                             this.series.name + ': ' + this.y + '<br/>' +
                             'Total: ' + this.point.stackTotal;
                     }
                 },
                  plotOptions: {
                     column: {
                         stacking: 'normal'
                     }
                  }
               },

              credits: {
                  enabled: false
               },

              series: [{
                  name: 'Total Changes',
                  color: vm.colors[3],
                  data: vm.users.totalMoodChanges,
                  stack: 'male'
              }, {
                  name: 'Positive Changes',
                  color: vm.colors[7],
                  data: vm.users.positiveMoodChanges,
                  stack: 'female'
              }, {
                  name: 'Negative Changes',
                  color: vm.colors[2],
                  data: vm.users.negativeMoodChanges,
                  stack: 'female'
              }]

            }//end of mood-changes graph

            vm.totalMoodBreakdownGraph = {
               options:{

                  chart: {
                     type: 'column'
                 },
                 title: {
                     text: 'Overall Moodchange Data'
                 },

                 xAxis: {
                     categories: ['Participants'],
                     crosshair: true
                 },
                 yAxis: {
                     min: 0,
                     title: {
                         text: 'Changes'
                     }
                 },
                 tooltip: {
                     headerFormat: '<span style="font-size:10px">{point.key}</span><table>',
                     pointFormat: '<tr><td style="color:{series.color};padding:0">{series.name}: </td>' +
                         '<td style="padding:0"><b>{point.y: .1f} </b></td></tr>',
                     footerFormat: '</table>',
                     shared: true,
                     useHTML: true
                 },
                 plotOptions: {
                     column: {
                         pointPadding: 0.2,
                         borderWidth: 0
                     }
                 }
               },
               series: [{
                  name: 'Total Changes',
                  color: vm.colors[3],
                  data: [parseInt(vm.findTotal('total_mood_changes'))]
               }, {
                  name: 'Positive Changes',
                  color: vm.colors[7],
                  data: [parseInt(vm.findTotal('positive_changes'))]
               }, {
                  name: 'Negative Changes',
                  color: vm.colors[2],
                  data: [parseInt(vm.findTotal('negative_changes'))]
               }],
               credits: {
                  enabled: false
               }

            } //end of mood-changes breakdown graph

            vm.negativeMoodBreakdownGraph = {

               options:{
                  chart: {
                     plotBackgroundColor: null,
                     plotBorderWidth: null,
                     plotShadow: false,
                     type: 'pie'
                  },
                  title: {
                     text: 'Negative Mood Change Triggers'
                  },
                  tooltip: {
                     borderColor: null,
                     pointFormat: '{series.data.name} {point.percentage:.1f}%</b>'
                  },
                  plotOptions: {
                     pie: {
                        allowPointSelect: true,
                        cursor: 'pointer',
                        dataLabels: {
                           enabled: true
                        }
                     }
                  }
               },
               credits: {
                  enabled: false
               },
               series: [{
                  name: 'Negative Triggers',
                  colorByPoint: true,
                  data: [{
                     name: 'Argument or Conflict',
                     color: vm.colors[0],
                     y: parseInt(vm.nimhData['neg_argument_or_conflict'])
                  }, {
                     name: 'Felt Rejected',
                     color: vm.colors[1],
                     y: parseInt(vm.nimhData['neg_felt_rejected'])
                  }, {
                     name: 'Lack of Sleep',
                     color: vm.colors[2],
                     y: parseInt(vm.nimhData['neg_lack_of_sleep'])
                  }, {
                     name: 'No trigger',
                     color: vm.colors[3],
                     y: parseInt(vm.nimhData['neg_no_trigger'])
                  }, {
                     name: 'Other',
                     color: vm.colors[4],
                     y: parseInt(vm.nimhData['neg_other'])
                  }, {
                     name: 'Pain Or Bodiy Discomfort',
                     color: vm.colors[5],
                     y: parseInt(vm.nimhData['neg_pain_or_bodiy_discomfort'])
                  },{
                     name: 'Problem at Work or School',
                     color: vm.colors[6],
                     y: parseInt(vm.nimhData['neg_problem_at_work_or_school'])
                  }, {
                     name: 'Received Bad News',
                     color: vm.colors[7],
                     y: parseInt(vm.nimhData['neg_received_bad_news'])
                  },{
                     name: 'Stress',
                     color: vm.colors[8],
                     y: parseInt(vm.nimhData['neg_stress'])
                  },{
                     name: 'Upset/Mad at Myself',
                     color: vm.colors[9],
                     y: parseInt(vm.nimhData['neg_upset_mad_at_myself'])
                  }, {
                     name: 'Used Alcohol',
                     color: vm.colors[10],
                     y: parseInt(vm.nimhData['neg_used_alcohol'])
                  },{
                     name: 'Used Drugs',
                     color: vm.colors[11],
                     y: parseInt(vm.nimhData['neg_used_drugs'])
                  }, {
                     name: 'Used Prescribed Medications',
                     color: vm.colors[12],
                     y: parseInt(vm.nimhData['neg_used_prescribed_medications'])
                  }]
               }]
               
            }// end of neg-mood breakdown graph

            vm.positiveMoodBreakdownGraph = {

               options:{
                  chart: {
                     plotBackgroundColor: null,
                     plotBorderWidth: null,
                     plotShadow: false,
                     type: 'pie'
                  },
                  title: {
                     text: 'Positive Mood Change Triggers'
                  },
                  tooltip: {
                     pointFormat: '{series.data.name} {point.percentage:.1f}%</b>'
                  },
                  plotOptions: {
                     pie: {
                        allowPointSelect: true,
                        cursor: 'pointer',
                        dataLabels: {
                           enabled: false
                        },
                        showInLegend: true
                     }
                  }
               },
               credits: {
                  enabled: false
               },
               series: [{
                  name: 'Positive Triggers',
                  colorByPoint: true,
                  data: [{
                     name: 'Exercised',
                     color: vm.colors[0],
                     y: parseInt(vm.nimhData['pos_exercised'])
                  },{
                     name: 'Felt Accepted and Supported',
                     color: vm.colors[2],
                     y: parseInt(vm.nimhData['pos_felt_accepted_and_supported'])
                  }, {
                     name: 'Had Nice Day or Evening',
                     color: vm.colors[3],
                     y: parseInt(vm.nimhData['pos_had_nice_day_or_evening'])
                  }, {
                     name: 'Had Sex',
                     color: vm.colors[4],
                     y: parseInt(vm.nimhData['pos_had_sex'])
                  }, {
                     name: 'No Trigger',
                     color: vm.colors[5],
                     y: parseInt(vm.nimhData['pos_no_trigger'])
                  },{
                     name: 'Other',
                     color: vm.colors[6],
                     y: parseInt(vm.nimhData['pos_other'])
                  }, {
                     name: 'Received Good News',
                     color: vm.colors[7],
                     y: parseInt(vm.nimhData['pos_received_good_news'])
                  },{
                     name: 'Someone Complemented Me',
                     color: vm.colors[8],
                     y: parseInt(vm.nimhData['pos_someone_complimented_me'])
                  },{
                     name: 'Spent Time with Someone Close',
                     color: vm.colors[9],
                     y: parseInt(vm.nimhData['pos_spent_time_with_someone_close'])
                  }, {
                     name: 'Used Alcohol',
                     color: vm.colors[10],
                     y: parseInt(vm.nimhData['pos_used_alcohol'])
                  },{
                     name: 'Used Drugs',
                     color: vm.colors[11],
                     y: parseInt(vm.nimhData['pos_used_drugs'])
                  }, {
                     name: 'Used Prescribed Medications',
                     color: vm.colors[12],
                     y: parseInt(vm.nimhData['pos_used_prescribed_medications'])
                  }]
               }]

            } //end of pos-mood breakdown graph

         }); // end of .then call for the service

      } //end of initNIMHController

   }//end of controller


}) ();