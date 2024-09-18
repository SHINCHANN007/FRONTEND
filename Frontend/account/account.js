
// display date navbar
const dateDisplay = document.getElementById('date-display');
const today = new Date();
const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
dateDisplay.innerText = today.toLocaleDateString(undefined, options);

// Function to handle image selection and update background
function changeImage1() {
    const input = document.getElementById('imageInput1');

    // Trigger file input dialog
    input.click();

    input.onchange = async function(event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();

            reader.onload = function(e) {
                // Set the background image of the .cover element
                document.querySelector('.cover').style.backgroundImage = `url(${e.target.result})`;
            };

            // Read the file as a Data URL
            reader.readAsDataURL(file);

            // Prepare FormData for the upload
            const formData = new FormData();
            formData.append('photo', file);

            // Retrieve the username from localStorage or another suitable source
            const username = localStorage.getItem('username'); // Ensure this key matches where you store the username
            if (username) {
                formData.append('username', username);
            } else {
                console.error('Username not found in localStorage');
                return; // Exit if username is not available
            }

            try {
                // Optionally, include a token if authentication is required
                const token = localStorage.getItem('token'); // Ensure this key matches where you store the token

                // Send the image and username to the server
                const response = await fetch('http://localhost:5000/api/auth/upload-photo', {
                    method: 'POST',
                    headers: {
                        'Authorization': token ? `Bearer ${token}` : '' // Include token if available
                    },
                    body: formData,
                });

                const data = await response.json();
                if (response.ok) {
                    if (data.message === 'Profile photo uploaded successfully') {
                        console.log('Image uploaded successfully!');
                    } else {
                        console.error('Image upload failed:', data.message);
                    }
                } else {
                    console.error('Image upload failed with status:', response.status);
                }
            } catch (error) {
                console.error('Error uploading image:', error);
            }
        }
    };
}



function changeImage2() {
            const input = document.getElementById('imageInput2');
            input.click();
        
            input.onchange = function(event) {
                const file = event.target.files[0];
                const reader = new FileReader();
        
                reader.onload = function(e) {
                    document.querySelector('.profile-img').style.backgroundImage = `url(${e.target.result})`;
                };
        
                if (file) {
                    reader.readAsDataURL(file); // Convert the file to a base64 string for the preview
                }
            };
}

/**display friends  */

const username = localStorage.getItem('username'); // to take username for fuctions

async function displayFriends() {
    const res=  await fetch(`http://localhost:5000/api/friend-requests/show/${username}`);

    const friends = await res.json();
    console.log(friends);

    const friendsList = document.getElementById('friends-list');
    friendsList.innerHTML = ''; // Clear existing friends list
    friends.friends.forEach(friend => {
        const li = document.createElement('li');
        li.innerText = friend; // Assuming friend object has a username property
        friendsList.appendChild(li);
    }
    );


}



// profile display

async function displayProfile(username) {
    try {

        //HIGHSCORE GETTER
        const response = await fetch('http://localhost:5000/api/game/top-scores', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ username, gameName: "dogGame" }),
        });

    
    
        if (!response.ok) { // Check if the response status is OK (status in the range 200-299)
            console.log('No response from server or response error:', response.statusText);
             // Exit early if response is not OK
            document.getElementById('high-score').innerText = `High Score: not their`;
            return;
        }
    
        const data = await response.json();
        console.log('Game score:', data.score); // Process the data as needed

        if (data.score !== undefined) {
            document.getElementById('high-score').innerText = `High Score: ${data.score}`;
        } else {
            console.error('Score not found in response data');
        }

        if (username) {
            document.getElementById('profile-name').innerText = `Name: ${username}`;
        } else {
            console.error('Username not found');
        }

        //EMAIL AND BIRTHDAY GETTER
        const response2 = await fetch('http://localhost:5000/api/auth/userdetails', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username}),
          });

          const data2 = await response2.json();

            if (data2.email !== undefined) {
                document.getElementById('email').innerText = `Email: ${data2.email}`;
            }else{
                console.error('Email not found in response data');
            }
            if(data2.birthday !== undefined){
                document.getElementById('birthday').innerText = `Birthday: ${data2.birthday}`;
            }else{
                console.error('Birthday not found in response data');
            }
        
    } catch (error) {
        console.error('There was a problem with the fetch operation:', error);
    }
}


displayProfile(username);
// logout
function logout(){
    localStorage.clear();
    window.location.href = '../login/login.html';
}

displayFriends();