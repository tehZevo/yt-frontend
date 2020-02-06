function extractVideoID(url){
    var regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#\&\?]*).*/;
    var match = url.match(regExp);
    if ( match && match[7].length == 11 ){
        return match[7];
    }else{
        return null;
    }
}

var corsProxy = "https://cors-anywhere.herokuapp.com/"

function playlistURL(uid)
{
  return `${corsProxy}https://www.youtube.com/playlist?list=UU${uid}&disable_polymer=true`;
}

async function getVideosOfChannel(uid)
{
  if(uid.startsWith("UU") || uid.startsWith("UC"))
  {
    uid = uid.slice(2);
  }
  console.log("fetching " + uid);

  var body = await fetch(playlistURL(uid), {
    headers: {
      "X-Requested-With": "fetch"
    },
  });

  body = await body.text();

  var s = $(body);

  var videos = s.find(".pl-video").map((i, e) =>
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

//generate embed
function generateEmbed(videoID, autoplay)
{
  autoplay = autoplay ? 1 : 0;
  //width="799" height="400"
  return `<iframe  src="https://www.youtube.com/embed/${videoID}?&autoplay=${autoplay}" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`
}
