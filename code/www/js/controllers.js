angular.module('songhop.controllers', ['ionic', 'songhop.services'])


    /*
     Controller for the discover page
     */
    .controller('DiscoverCtrl', function ($scope,$ionicLoading, $timeout,User,Recommendations) {
        // helper functions for loading
        var showLoading = function() {
            $ionicLoading.show({
                template: '<i class="ion-loading-c"></i>',
                noBackdrop: true
            });
        }

        var hideLoading = function() {
            $ionicLoading.hide();
        }

        // set loading to true first time while we retrieve songs from server.
        showLoading();
        //..........loading

        // get our first songs
        Recommendations.init()
            .then(function(){
                $scope.currentSong = Recommendations.queue[0];
                Recommendations.playCurrentSong();
            }).then(function(){
                // turn loading off
                hideLoading();
                $scope.currentSong.loaded = true;
            });

        // initialize the current song
        //$scope.currentSong = angular.copy($scope.songs[0]);

        $scope.sendFeedback = function (bool) {
            // first, add to favorites if they favorited
            if (bool) User.addSongToFavorites($scope.currentSong);
            // set variable for the correct animation sequence
            $scope.currentSong.rated = bool;
            $scope.currentSong.hide = true;

            $timeout(function () {
                // $timeout to allow animation to complete before changing to next song
                // set the current song to one of our three songs
                //var randomSong = Math.round(Math.random() * ($scope.songs.length - 1));
                // prepare the next song
                Recommendations.nextSong();
                // update current song in scope
               // $scope.currentSong = angular.copy($scope.songs[randomSong]);
                $scope.currentSong = Recommendations.queue[0];

                $scope.currentSong.loaded = false;


            }, 250);

            Recommendations.playCurrentSong().then(function() {
                $scope.currentSong.loaded = true;
            });

        };

        // used for retrieving the next album image.
        // if there isn't an album image available next, return empty string.
        $scope.nextAlbumImg = function() {
            if (Recommendations.queue.length > 1) {
                return Recommendations.queue[1].image_large;
            }

            return '';
        };



    })


    /*
     Controller for the favorites page
     */
    .controller('FavoritesCtrl', function ($scope, $timeout, User) {
        // get the list of our favorites from the user service
        $scope.favorites = User.favorites;

        $scope.removeSong = function(song, index) {
            User.removeSongFromFavorites(song, index);
        }

        $scope.openSong = function(song) {
            $window.open(song.open_url, "_system");
        }


    })


    /*
     Controller for our tab bar
     */
    .controller('TabsCtrl', function ($scope,Recommendations,User) {

        // expose the number of new favorites to the scope
        $scope.favCount = User.favoriteCount;

        // stop audio when going to favorites page
        $scope.enteringFavorites = function() {
            User.newFavorites = 0;
            Recommendations.haltAudio();
        }

        $scope.leavingFavorites = function() {
            Recommendations.init();
        }

    });