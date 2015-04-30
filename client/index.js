'use strict';

$(document).ready(init);

function init() {
  populateProfiles();
}

var currTime = moment.utc();

var profiles = [];

function populateProfiles(){
  $.getJSON('https://api.github.com/orgs/coding-house-apr2015/members', function(loginResponse){
    loginResponse.forEach(function(profile){
      profiles.push({'un': profile.login});
    });
    generateTiles();
  });
}

function generateTiles() {
  profiles.forEach(function(profile){
    var profileUrl = 'https://api.github.com/users/' + profile.un;
    var eventsUrl = profileUrl + '/events';
    $.getJSON(profileUrl, function(profileresponse){
      $.getJSON(eventsUrl, function(eventsresponse){
        var commitCount = countCommits(eventsresponse);
        var PRCount = countPRs(eventsresponse);
        var commentCount = countComments(eventsresponse);
        //calcScore(commitCount, PRCount, commentCount);
        var $newRow = $("#template").clone();
        $newRow.find(".image").attr("src", profileresponse.avatar_url);
        $newRow.find(".name").text(profileresponse.name);
        $newRow.find(".commits").text(commitCount + ' Commits');
        $newRow.find(".comments").text(commentCount + ' Comments');
        $newRow.find(".pulls").text(PRCount + ' Pull Requests');
        $newRow.find(".card.row").addClass('status-'+calcScore(commitCount, PRCount, commentCount));
        //$newRow.find(".card.row").css(calcScore(commitCount, PRCount, commentCount));
        $newRow.removeClass('hidden');
        $('#cards-container').append($newRow);
      });
    });
  });
}

// function colorTiles(score){
//   return score > 55 ? 'green' : 'red';
// }

function countCommits(eventsresponse){
  var commits = 0;
  eventsresponse.forEach(function(event){
    if(event.payload.comment !== '' && moment.utc(event.created_at).diff(currTime, 'hours') > -24){
      commits++;
    }
  });
  return commits;
}

function countPRs(eventsresponse){
  var prs = 0;
  eventsresponse.forEach(function(event){
    if(event.type === 'PullRequestEvent' && moment.utc(event.created_at).diff(currTime, 'hours') > -24){
      prs++;
    }
  });
  return prs;
}
function countComments(eventsresponse){
  var commentCount = 0;
  eventsresponse.forEach(function(event){
    if(event.type.match(/(comment)/gi)){
      commentCount++;
    }
  });
  return commentCount;
}
function calcScore(commits, prs, comments){
  var score = ((commits * 10) + (prs * 15) + comments);
  return score > 55 ? 'pass' : 'fail';
}
