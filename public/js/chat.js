const socket = io();

//Element
const $messageForm = document.querySelector("#message-form");
const $messageFormInput = $messageForm.querySelector('input');
const $messageFormButton = $messageForm.querySelector('button');
const $messageLocaltionButton = document.querySelector('#send-location');
const $massages = document.querySelector("#massages")
const $sidebar = document.querySelector("#sidebar")
//Templates
const messageTemplate = document.querySelector("#message-template").innerHTML
const locationMessageTemplate = document.querySelector("#location-message-template").innerHTML
const slidebarTemplate = document.querySelector("#sidebar-template").innerHTML


//Option
const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true })

//AutoScroll
const autoScroll = () =>
{
	//new message ilement
	const $newMessage = $massages.lastElementChild

	//Height of the new message
	const newMessageStyles = getComputedStyle($newMessage)
	const newMessageMargin = parseInt(newMessageStyles.marginBottom)
	const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

	//Visible Height
	const visibleHeight = $massages.offsetHeight

	//Height of messages container
	const containerHeight = $massages.scrollHeight

	//How far have i scroll
	const scrollOffset = $newMessage.scrollTop + visibleHeight

	if (containerHeight - newMessageHeight >= scrollOffset)
	{
		console.log($massages.scrollHeight)
		$massages.scrollTop = $massages.scrollHeight
	}
}


socket.on("message", (message) => {
  const html = Mustache.render(messageTemplate, {
		message: message.text,
		createdAt: moment(message.createdAt).format('h:mm a'),
		username: message.username
  })
	$massages.insertAdjacentHTML('beforeend', html)
	autoScroll()
});

socket.on("localtionMessage", (message) =>
{
	console.log(message.url)
	const html = Mustache.render(locationMessageTemplate, {
		url: message.url,
		createdAt: moment(message.createdAt).format('h:mm a'),
		username: message.username
	})
	$massages.insertAdjacentHTML('beforeend', html)
	autoScroll()
})

socket.on("roomData", ({ room, users }) =>
{
	const html = Mustache.render(slidebarTemplate,
		{
			room,
			users
		})
		document.querySelector("#sidebar").innerHTML = html
})

$messageForm.addEventListener("submit", (e) => {
	e.preventDefault();

  $messageFormButton.setAttribute("disabled", "disabled");

	const message = e.target.elements.message.value;

  socket.emit("sendMessage", message, (error) =>
  {
   
    $messageFormInput.focus();
    $messageFormInput.value = "";
		if (error) {
			return console.log(error);
    }
    $messageFormButton.removeAttribute("disabled");
		console.log("The message was delivered!");
	});
});

$messageLocaltionButton.addEventListener("click", () => {
	if (!navigator.geolocation) {
		return alert("Geolocation is not supported by your browser.");
  }
  
  $messageLocaltionButton.setAttribute("disabled", "disabled");

	navigator.geolocation.getCurrentPosition((position) => {
		socket.emit(
			"sendLocation",
			{
				latitude: position.coords.latitude,
				longitude: position.coords.longitude,
			},
      () =>
      {
        $messageLocaltionButton.removeAttribute("disabled");
				console.log("localtion share");
			}
		);
	});
});


socket.emit("join", { username, room }, (error) =>
{
	if (error)
	{
		alert(error)
		location.href = "/"
	}
})