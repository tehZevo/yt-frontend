var cheerio = require("cheerio")
var request = require("request-promise")

function extractVideoID(url){
    var regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#\&\?]*).*/;
    var match = url.match(regExp);
    if ( match && match[7].length == 11 ){
        return match[7];
    }else{
        return null;
    }
}

//user id: https://www.youtube.com/user/LinusTechTips
//channel id: UCXuqSBlHAE6Xw-yeJA0Tunw
//playlist id: UUXuqSBlHAE6Xw-yeJA0Tunw
//https://www.youtube.com/playlist?list=UUXuqSBlHAE6Xw-yeJA0Tunw&disable_polymer=true

function playlistURL(uid)
{
  return `https://www.youtube.com/playlist?list=UU${uid}&disable_polymer=true`;
}

async function getVideosOfChannel(uid)
{
  if(uid.startsWith("UU") || uid.startsWith("UC"))
  {
    uid = uid.slice(2);
  }
  console.log(uid);

  var body = await request(playlistURL(uid));

  var $ = cheerio.load(body);

  var videos = $(".pl-video").map((i, e) =>
  {
    e = $(e);
    var titleLink = e.find(".pl-video-title-link");
    var id = extractVideoID(titleLink.attr("href"));
    var title = titleLink.text().trim();
    var thumb = `https://img.youtube.com/vi/${id}/0.jpg`;
    var length = e.find(".timestamp > span").text();

    return {id, title, thumb, length};
  }).toArray();

  return videos;
}

getVideosOfChannel("UUXuqSBlHAE6Xw-yeJA0Tunw");

//generate embed
function generateEmbed(videoID)
{
  return `<iframe width="799" height="400" src="https://www.youtube.com/embed/${videoID}" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`
}
