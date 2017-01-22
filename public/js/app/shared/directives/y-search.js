/*
 * [y] hybris Platform
 *
 * Copyright (c) 2000-2014 hybris AG
 * All rights reserved.
 *
 * This software is the confidential and proprietary information of hybris
 * ("Confidential Information"). You shall not disclose such Confidential
 * Information and shall use it only in accordance with the terms of the
 * license agreement you entered into with hybris.
 */

'use strict';

angular.module('ds.ysearch', ['algoliasearch'])
    .directive('ysearch', function () {
        return {
            controller: 'ysearchController',
            restrict: 'E',
            scope: {
                parametersToReturn: '=?returnParameters',
                page: '=?page',
                searchString: '=?searchString'
            },
            replace: true,
            templateUrl: 'js/app/shared/templates/ysearch.html'
        };
    });

angular.module('ds.ysearch')
    .controller('ysearchController', ['$scope', '$rootScope', '$state', 'ysearchSvc', 'YrnSvc', 'GlobalData', function (scope, $rootScope, $state, ysearchSvc, YrnSvc, GlobalData) {

        if (!scope.page) {
            scope.page = 0;
        }
        if (!scope.searchString) {
            scope.searchString = '';
        }
        scope.search = {
            text: scope.searchString,
            results: [],
            numberOfHits: 0,
            showSearchResults: false,
            searchAvailable: false,
            searchError: false,
            zeroResults: false
        };

        scope.yglyphiconVisible = false;

        //Init of algolia search service
        ysearchSvc.init().then(function () {
            scope.search.searchAvailable = ysearchSvc.getPublicSearchEnabled();
        });

        scope.showSearchResults = function () {
            // load the currency before displaying the search results
            // to ensure we get the current site's one
            scope.currency = GlobalData.getCurrency();
            scope.currencySymbol = GlobalData.getCurrencySymbol();

            scope.search.showSearchResults = true;
            if (scope.search.text !== '') {
                if (scope.search.results.length === 0) {
                    scope.doSearch(scope.search.text, 0);
                }
            }
        };

        scope.hideSearchResults = function () {
            $rootScope.closeOffcanvas();
            scope.search.showSearchResults = false;
        };

        //Used for checking if the user left the search field
        angular.element(document)
            .bind('mouseup', function (e) {
                var container = angular.element('.y-search');
                if (!container.is(e.target) && container.has(e.target).length === 0) {
                    scope.search.showSearchResults = false;
                    //Used to apply changes for showSearchResults
                    scope.$digest();
                }
            });

		scope.extractProductAndVariantParameters = function(algoliaObjectId) {


			if(!YrnSvc.isValidYrn(algoliaObjectId)) {
				return  {productId: algoliaObjectId, variantId:null};
			}

			var result;

			var yrn = YrnSvc.parse(algoliaObjectId);

			if(yrn.resource === 'product') {
				result = { productId: yrn.resourceIds.productId, variantId:null};
			}
			else if(yrn.resource === 'product-variant') {
				result = { productId: yrn.resourceIds.productId, variantId: yrn.resourceIds.variantId};
			}


			return result;
		};




        scope.doSearch = function () {
            scope.search.showSearchResults = true;
            if (scope.search.text === '') {
                scope.search.showSearchResults = false;
                scope.search.results = [];
                scope.search.numberOfHits = 0;
            }
            else {
                ysearchSvc.getResults(scope.search.text, { hitsPerPage: 5, page: 0 })
                    .then(function (content) {
                        if (content.query !== scope.search.text) {
                            // do not take out-dated answers into account
                            return;
                        }
                        //Hide error only when search was ok
                        scope.search.searchError = false;
                        scope.search.numberOfHits = content.nbHits;
                        scope.search.results = content.hits;
                        scope.search.searchError = false;

                        if (content.hits.length === 0) {
                            scope.search.zeroResults = true;
                        }
                        else {
                            scope.search.zeroResults = false;
                        }
                    }, function () {
                        //Show error that search didn't perform correctly.
                        scope.search.searchError = true;
                    });
            }
        };

        scope.goToResultsPage = function () {
            if (scope.search && scope.search.text && scope.search.text.length) {
                scope.hideSearchResults();
                $state.go('base.search', { searchString: scope.search.text });
            }
        };

        scope.className = 'btn btn-lg btn-success';
        scope.voiceButtonText = 'Start Listening';

        var socket,
            audioRecorder,
            shouldStopRecording;

        scope.voiceToggle = function() {
            switch (scope.className) {
                case 'btn btn-lg btn-danger active':
                    scope.className = 'btn btn-lg btn-success';
                    scope.voiceButtonText = 'Start Listening';

                    shouldStopRecording = true;
                    if (audioRecorder) {
                        audioRecorder.stop();
                        audioRecorder = undefined;
                    }
                    if (socket) {
                        socket.send(JSON.stringify({
                            endcommand: {}
                        }));
                    }
                    break;
                default:
                    scope.className = 'btn btn-lg btn-danger active';
                    scope.voiceButtonText = 'Stop Listening';
                    shouldStopRecording = false;
                    scope.startListening();
            }
        };

        scope.startListening = function() {
            var sHost = "nim-rd.nuance.mobi";
            var sPort = 9443;
            var socketPath = "nina-webapi/nina";

            var nmaid = "Nuance_ConUHack2017_20170119_210049";
            var nmaidKey = "0d11e9c5b897eefdc7e0aad840bf4316a44ea91f0d76a2b053be294ce95c7439dee8c3a6453cf7db31a12e08555b266d54c2300470e4140a4ea4c8ba285962fd";
            var username = "websocket_sample";

            var appName = 'SamAppJan20';
            var companyName = 'SamCoJan2017';
            var cloudModelVersion = '1.0';
            var clientAppVersion = '0.0';
            var defaultAgent = 'http://ac-srvozrtr01.dev.ninaweb.nuance.com/nuance-nim_team-englishus-WebBotRouter/jbotservice.asmx/TalkAgent';

            socket = new WebSocket("wss://" + sHost + ":" + sPort + "/" + socketPath);
            socket.binaryType = "arraybuffer";

            socket.onmessage = function (event) {
                if (isOfType("ArrayBuffer", event.data))
                {
                    console.log("ArrayBuffer");
                    audioPlayer.play(event.data);
                }
                else
                {
                    var response = JSON.parse(event.data);
                    console.log(response);
                }
            };

            socket.onopen = function () {
                socket.send(JSON.stringify({
                    connect: {
                        nmaid: nmaid,
                        nmaidKey: nmaidKey,
                        username: username
                    }
                }));

                socket.send(JSON.stringify({
                    command: {
                        name: "NinaStartSession",
                        logSecurity: 'off', // off, mask, encrypt
                        appName: appName,
                        companyName: companyName,
                        cloudModelVersion: cloudModelVersion,
                        clientAppVersion: clientAppVersion,
                        agentURL: defaultAgent,
                        apiVersion: 'LATEST'
                    }
                }));

                socket.send(JSON.stringify({
                    command: {
                        name: "NinaDoSpeechRecognition",
                        logSecurity: 'off',
                        sr_engine: 'NR',
                        sr_engine_parameters: {"operating_mode":'accurate'} // accurate, fast, warp
                    }
                }));

                audioRecorder = new AudioRecorder(initAudioContext());

                audioRecorder.start().then(
                    function () {
                        // console.log("Recorder stopped.");
                    },

                    function () {
                        // console.log("Recording failed!!!");
                    },

                    function (data) {
                        // console.log("Audio data received...");

                        if (shouldStopRecording) {
                            return;
                        }

                        // tuple: [encodedSpx, ampArray]
                        //   resampled audio as Int16Array
                        //   amplitude data as Uint8Array
                        var frames = data[0]; // Int16Array

                        socket.send(frames.buffer);
                    }
                );
            };
        };
    }]);


angular.module('ds.ysearch')
    .factory('ysearchSvc', ['algolia', 'ysearchREST', '$q', function (algolia, ysearchREST, $q) {
        var client, index, algoliaConfiguration;
        var publicSearchEnabled = false;

        var init = function () {
            var promise = $q.when(getAlgoliaConfiguration());
            promise.then(function (config) {
                if (!config.algoliaCredentials) {
                    config.algoliaCredentials = {
                        applicationId: '',
                        searchKey: '',
                        indexName: ''
                    };
                }
				if ( (config.indexing  && Boolean(config.indexing.activePublishedProductIndexing)) ||
					(!config.indexing && Boolean(config.activation))) {
					publicSearchEnabled = true;
				}

				client = algolia.Client(config.algoliaCredentials.applicationId, config.algoliaCredentials.searchKey, { method: 'https' });
                index = client.initIndex(config.algoliaCredentials.indexName);
            });
            return promise;
        };

        var getPublicSearchEnabled = function () {
            return publicSearchEnabled;
        };

        var getAlgoliaConfiguration = function () {
            if (!!algoliaConfiguration) {
                return algoliaConfiguration;
            }
            else {
                algoliaConfiguration = ysearchREST.AlgoliaSettings.all('project').get('configuration');
            }
            return algoliaConfiguration;
        };

        var getResults = function (searchString, parameters) {
            if (index) {
                return index.search(searchString, parameters);
            }
            else {
                return init()
                        .then(function () {
                            return index.search(searchString, parameters);
                        });
            }
        };

        return {
            init: init,
			getPublicSearchEnabled: getPublicSearchEnabled,
            getResults: getResults
        };
    }]);

angular.module('ds.ysearch')
    .factory('ysearchREST', ['SiteConfigSvc', 'Restangular', function (siteConfig, Restangular) {
        return {
            AlgoliaSettings: Restangular.withConfig(function (RestangularConfigurer) {
                RestangularConfigurer.setBaseUrl(siteConfig.apis.indexing.baseUrl);
            })
        };
    }]);
