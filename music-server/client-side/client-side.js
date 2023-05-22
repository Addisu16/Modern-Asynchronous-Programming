window.onchange = function () {

  document.getElementById('loginBtn').addEventListener('click', login);
  document.getElementById('logout').addEventListener('click', logout);
}

async function login() {
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;

  const response = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
          username,
          password
      }),
      headers: {
          'Content-Type': 'application/json'
      }
  });

  if (response.ok) {
      const result = await response.json();
      sessionStorage.setItem('token', result.accessToken);
      sessionStorage.setItem('username', result.username);
      document.getElementById('main-div').style.display = 'none';
      document.getElementById('main-div2').style.display = 'block';
      document.getElementById('logout').style.display = 'block';
      //document.getElementById("favorites").style.display = 'block';
      //document.getElementById('play').style.display = 'block';
      document.getElementById('table-div').style.display = 'block';

      fetchAllSongs();



  } else {
      document.getElementById('errorMsg').innerText = 'Incorrect username and password';
  }

}


let musicList = null;

async function fetchAllSongs() {
  let response = await fetch("http://localhost:3000/api/music", {
      headers: {
          Authorization: `Bearer ${sessionStorage.getItem("token")}`,
      },
  })
  let songs = await response.json();
  musicList = songs;
  printAllSongs(songs);
};

//Display all songs
//=================================================================================================================//
let count = 1;
function printAllSongs(list) {
  for (let eachMusic of list) {
      fetch(`http://localhost:3000/${eachMusic.urlPath}`, {
          headers: {
              Authorization: `Bearer ${sessionStorage.getItem("token")}`,
          },
      }).then((songs) => {
          let myTable = `
          <tr>
          <td>${count++}</td>
          <td><a href="${songs.url}">${eachMusic.title}</a><br></td>
          <td>${eachMusic.releaseDate}</td>
          <td><button class="addBtn" id=${eachMusic.id} onclick="addToFavorites('${eachMusic.id}')">+</button></td>
          </tr>
         `;
          document.getElementById("myTable").innerHTML += myTable;
      });
  }
}

//Add to favorite list
//=================================================================================================================//
let favorites = [];

let index = 0;
let countt = 1;
function addToFavorites(id) {
  for (let each of musicList) {
      if (each.id == id) {
          if (favorites.includes(each)) {
              continue;
          } else {
              favorites.push(each);
              fetch(`http://localhost:3000/${each.urlPath}`, {
                  headers: {
                      Authorization: `Bearer ${sessionStorage.getItem("token")}`,
                  },
              }).then((music) => {
                  let id = music.id;
                  let title = each.title;
                  let url = music.url;
                  let myFavoriteTable = `
    
      <tr>
        <td>${countt++}</td>
            <td><a href="${music.url}">${each.title}</a><br></td>
            <td><button class="addBtn" id=${each.id} onclick="removeToFavorites('${each.id}')">X</button>
             <button class="addBtn" onclick="playMusic('${music.url}','${each.title}','${index}')">play</button></td>
        </tr>
      `;
                  //========================================================================================//
                  fetch(`http://localhost:3000/${each.urlPath}`, {
                      method: "POST",
                      body: JSON.stringify({
                          id,
                          title,
                          url,
                      }),
                      headers: {
                          "Content-Type": "application/json",
                      },
                  })
                  index++;

                  document.getElementById("myFavoriteTable").innerHTML += myFavoriteTable;
              });
          }
      }
  }
}
//   <tr id=${each.id}>
async function playMusic(music, title, id) {
  document.getElementById("musicName").innerHTML = title;
  document.getElementById("play").src = music;
  currentPlayingIndex = id;

  let arr = [];
  for (let eachMusic of favorites) {
      let myPlayList = await fetch(`http://localhost:3000/${eachMusic.urlPath}`, {
          headers: {
              Authorization: `Bearer ${sessionStorage.getItem("token")}`,
          },
      });
      arr.push(myPlayList.url);
  }

  let audio = document.getElementById("play");
  audio.onended = () => {
      currentPlayingIndex++;
      if (currentPlayingIndex >= arr.length) {
          currentPlayingIndex = 0;
      }
      audio.src = arr[currentPlayingIndex];
      document.getElementById("musicName").innerHTML =
          musicList[currentPlayingIndex].title;
  };
  console.log(favorites);
}

//Remove from list
//=================================================================================================================//
function removeToFavorites(id) {
  favorites = favorites.filter((myFav) => myFav.id != id);
  document.getElementById(id);
  document.getElementById("myFavoriteTable");
  createTable(favorites);
}
let count3 = 1;
function createTable(table) {
  document.getElementById("myFavoriteTable").innerHTML = `
  <tr>
  <th>ID</th>
  <th>Order </th>
  <th>Action</th>    
  </tr>
      `;
      table.forEach((each) => {
        fetch(`http://localhost:3000/${each.urlPath}`, {
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem("token")}`,
          },
        })
          .then((music) => {
            let myFavoriteTable = `
              <td>${count3++}</td>
              <td><a href="${music.url}">${each.title}</a><br></td>
              <td>
                <button class="addBtn" id=${each.id} onclick="removeToFavorites('${each.id}')">X</button>
                <button class="addBtn" onclick="playMusic('${music.url}','${each.title}','${index}')">play</button>
              </td>
            `;
            document.getElementById("myFavoriteTable").innerHTML += myFavoriteTable;
          });
      });
    }
      
    favorites = []; // Assuming you have an array of favorite music
    let currentPlayingIndex = 0;
    //let nextBtn = document.getElementById("next-Button");
    
    const nextButton = async function () {
        let nextMusic = currentPlayingIndex;
        if (favorites.length !== 0) {
            nextMusic = (nextMusic + 1) % favorites.length;
            let nextPlay = await fetch(
                `http://localhost:3000/${favorites[nextMusic].urlPath}`,
                {
                    headers: {
                        Authorization: `Bearer ${sessionStorage.getItem("token")}`,
                    },
                }
            );
            document.getElementById("musicName").innerHTML = favorites[nextMusic].title;
            document.getElementById("play").src = nextPlay.url;
            currentPlayingIndex = nextMusic;
        }
    };
    
    console.log(favorites);
    console.log(currentPlayingIndex);
    console.log(nextBtn);
    
    
    // Play previous
let previous = document.getElementById("previous");
    
      
  previous.onclick=async ()=> {
        let playPrevious = currentPlayingIndex;
        
        if (favorites.length !== 0) {
          if (currentPlayingIndex === 0) {
            playPrevious = favorites.length - 1;
          } else {
            playPrevious--;
            if (playPrevious < 0) {
              playPrevious = favorites.length - 1;
            }
          }
          let prevPlay = await fetch(
            `http://localhost:3000/${favorites[playPrevious].urlPath}`,
            {
              headers: {
                Authorization: `Bearer ${sessionStorage.getItem("token")}`,
              },
            }
          );
      
          document.getElementById("musicName").innerHTML = "";
          document.getElementById("play").src = "";
      
          document.getElementById("musicName").innerHTML = favorites[playPrevious].title;
          document.getElementById("play").src = prevPlay.urlPath; 
          currentPlayingIndex = playPrevious;
        }
      };
      
    // Shuffle
    //let shuffle = document.getElementById("shuffle");
   // let repeat = document.getElementById("repeat");
    
    const shuffle = async function () {
        shuffle.style.display = "none";
        repeat.style.display = "block";
    
        let arr = [];
        for (let eachMusic of favorites) {
            let response = await fetch(`http://localhost:3000/${eachMusic.urlPath}`, {
                headers: {
                    Authorization: `Bearer ${sessionStorage.getItem("token")}`,
                },
            });
            let data = await response.json();
            arr.push(data.urlPath);
        }
    
        let audio = document.getElementById("play");
    
        audio.onended = () => {
            currentPlayingIndex = Math.floor(Math.random() * favorites.length);
            audio.src = arr[currentPlayingIndex];
            document.getElementById("musicName").innerHTML = favorites[currentPlayingIndex].title;
        };
    };
    
    // Repeat one song
    const repeat = async function () {
        repeat.style.display = "none";
        shuffle.style.display = "block";
    
        if (favorites.length !== 0) {
            let repeatPlay = await fetch(
                `http://localhost:3000/${favorites[currentPlayingIndex].urlPath}`,
                {
                    headers: {
                        Authorization: `Bearer ${sessionStorage.getItem("token")}`,
                    },
                }
            );
    
            document.getElementById("musicName").innerHTML = "";
            document.getElementById("play").src = "";
            document.getElementById("musicName").innerHTML = favorites[currentPlayingIndex].title;
            document.getElementById("play").src = repeatPlay.urlPath;
        }
    };
    



function logout() {
  sessionStorage.removeItem("username");
  sessionStorage.removeItem("token");
  document.getElementById('main-div2').innerHTML = '';
  //document.getElementById('table-div').innerHTML = '';
  document.getElementById('main-div2').style.display = 'none';
  document.getElementById('logout').style.display = 'none';
  document.getElementById('main-div').style.display = 'block';

  location.reload();
  //document.getElementById("favorites").style.display = 'none';


  // document.getElementById('play').style.display = 'none';
  // document.getElementById('priv').style.display = 'none';
  // document.getElementById('next').style.display = 'none';
  // document.getElementById('shuffle').style.display = 'none';
  // document.getElementById('repeat').style.display = 'none';

  



}
