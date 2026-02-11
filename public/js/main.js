async function handleSignup() {
  const username = document.getElementById("username").value.trim()
  const email = document.getElementById("email").value.trim()
  const password = document.getElementById("password").value.trim()
  const msg = document.getElementById("msg")

  if (!username || !email || !password) {
    msg.innerText = "All fields are required"
    msg.style.color = "red"
    return
  }

  try {
    const res = await fetch("https://simple-blog-app-nu.vercel.app/api/auth/register-user", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, email, password })
    })

    const data = await res.json()

    if (res.ok) {
      msg.innerText = "Account created successfully"
      msg.style.color = "green"
      setTimeout(() => {
        window.location.href = "/signin"
      }, 1500)
    } else {
      msg.innerText = data.message
      msg.style.color = "red"
    }
  } catch {
    msg.innerText = "Something went wrong"
    msg.style.color = "red"
  }
}


async function handleSignin() {
  const email = document.getElementById("email").value.trim()
  const password = document.getElementById("password").value.trim()
  const msg = document.getElementById("msg")

  if (!email || !password) {
    msg.innerText = "All fields are required"
    msg.style.color = "red"
    return
  }

  try {
    const res = await fetch("https://simple-blog-app-nu.vercel.app/api/auth/sign-in-user", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    })

    const data = await res.json()

    if (res.ok) {
      msg.innerText = "Login successful"
      msg.style.color = "green"
      setTimeout(() => {
        window.location.href = "/home"
      }, 1500)
    } else {
      msg.innerText = data.message
      msg.style.color = "red"
    }
  } catch {
    msg.innerText = "Something went wrong"
    msg.style.color = "red"
  }
}

