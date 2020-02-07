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

function channelURL(username)
{
  return `${corsProxy}https://www.youtube.com/user/${username}/?disable_polymer=true`;
}

function channelIdURL(id)
{
  return `${corsProxy}https://www.youtube.com/channel/${id}/?disable_polymer=true`;
}

async function getChannelInfo(id)
{
  //channel-header-profile-image
  var body = await fetch(channelIdURL(id), {
    headers: {
      "X-Requested-With": "fetch"
    },
  });

  body = await body.text();

  var s = $(body);
  var channelIcon = s.find(".channel-header-profile-image").attr("src")
  var banner = s.find(".hd-banner-image").css('background-image') //TODO
  //banner = banner.replace('url(','').replace(')','').replace(/\"/gi, "");
  console.log({channelIcon, banner})
  return {channelIcon, banner}
}

async function getIdOfUser(user)
{
  //fetch https://www.youtube.com/user/<user>/?disable_polymer=1
  //<meta itemprop="channelId" content="UCXuqSBlHAE6Xw-yeJA0Tunw">
  var body = await fetch(channelURL(user), {
    headers: {
      "X-Requested-With": "fetch"
    },
  });

  body = await body.text();

  //h̶̿ͧ̀e̿͑ͨ̈ͤ́ͧ ̨ͤ̎̾̃ͤç̎́͊ͫo̾͆̍̇̈́̓m͐̏̈ͤͪ͋̀e̓̌͂̓ͤ̀ŝ͠
  var match = body.match(/<meta\s+itemprop="channelId"\s+content="(.*)"/)
  return match[1];
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
    var length = e.find(".timestamp > span").text();

    return {id, title, length};
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
