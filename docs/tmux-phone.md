I finally sat down and just figured out how to do it.

I’ve had agents coding for me for a while now, and it’s been really fun and definitely has unlocked a lot of productivity. One thing kept bothering me though, was how you have to “hover” around your computer all the time keeping tabs on the status of the agent.

I also am trying to build side projects in my after work hours and weekends, but i have a family of 3 kids and a wife which are my biggest blessings in life, so more time at the computer on evenings and weekends was killing me.

I knew there had to be a way to connect using my phone instead, but it seemed cognitively too complicated to figure out, so I kept putting it off.

Well I finally spent the time and boy oh boy it’s really been an unlock for me. I now can spend 30 seconds prompting on my phone and send the agent on a task that i get notified when done or when it needs input again. Its helping me get SO much more done on side projects, because it doesn’t require me scheduling time away from my family to get progress on them.

If you haven’t tried it yet, maybe this helps!

1. On your computer, work like normal, just start your agent in a tmux session instead of a regular terminal window: tmux new -As <your-session-name>.
2. Run your coding agent inside that tmux session.
3. On your Mac, enable SSH access in System Settings > General > Sharing > Remote Login.
4. Install Tailscale on both your computer and phone, then use it to find your computer’s device hostname/IP.
5. Install Termius on your phone and create an SSH connection to your computer [Host = the Tailscale device hostname/IP, Username = your Mac login username, Password or Key = your normal sign-in
 method, Port = 22 unless you changed it].
6. From your phone, connect in Termius and SSH into your machine: ssh <user>@<host>.
7. Reconnect later with tmux attach -t <your-session-name> or, if you forget the session name, tmux ls.
8. Your agent uses ntfy to notify you on your phone when it’s done or needs input again.
