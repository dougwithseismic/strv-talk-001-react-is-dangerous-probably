# STRV Frontend Talk: React is Dangerous, Probably (or why are you hacking yourself.)

![STRV Talk](https://img.shields.io/badge/STRV%20Talk-001-blue)

By Doug Silkstone <Doug@withseismic.com>

## Introduction

Hi. I'm Doug. I'm the newest frontend developer here at STRV so here's the TL;DR on my origin story.

- **Mongrel Background**: A marketer turned fullstack developer. Started career turning Google ads off at the end of every day.
- **Growth Engineering Expert**: Massive proponent of Automation and AI - Eight years Growth Engineering consultancy. Fun fact, I nearly joined STRV Labs five or six years ago as Growth Manager.
- **Entrepreneurial Spirit**: Successfully built and exited four businesses - Robot armies. Blocking Honey discount extensions etc.
- **International Experience**: Originally from Bristol, UK - Drum and Bass Capital. Seven years as an expat - This year I was in Kyiv, recently returned to Prague for obvious reasons. Drone hit our building. No fun for anyone.
- **Current Role**: Joined STRV as a Fullstack Developer. Looking to learn as much about STRV and top tier product delivery as possible.

Today's talk is about how an untimely encounter with malware pirates ended up with me hacking myself for profit, uncovering just how dangerous React can be, and how we as developers can avoid landing ourselves in deep shit :robot:

## What is Promptheus?

Promptheus was a Chrome extension that gained significant traction:

- Launched to acclaim, receiving positive feedback from the developer community and tech enthusiasts
- Featured in an MIT course on web development and browser extensions, showcasing its innovative approach
- Amassed over 250,000 users across various demographics, from students to professionals

However, its success story took an unexpected turn, revealing the vulnerabilities inherent in popular browser extensions...

[RIP Promptheus 1](https://chromewebstore.google.com/detail/promptheus-converse-with/eipjdkbchadnamipponehljdnflolfki)

## The 404 Incident

>be me, code monkey trying to flex on normies with portfolio
>check old project for case study
>wtf.jpg
>extension page 404'ing
>mfw my baby is gone
>investigate.exe
>find out some anon bought my extension
>ohshi.gif
>250k+ downloads, 30k active users
>all compromised by adware
>tfw your creation is now ****....****
>analyze the damage
>just popups wow
>"seriously? you could've done so much worse"
>big brain time
>realize potential for real fuckery
>data theft, cred harvesting, network pwning
>curiosity intensifies
>go down the rabbit hole of extension vulnerabilities
>Twitter DMS? mind = blown
>hackerone: y r u hackin urself? bounty denied.
>ok ok next steps? the people must know

## Weaponizing Chrome Extensions

As Mark Twain said, "It ain't what you don't know that gets you into trouble. It's what you know for sure that just ain't so."

Developers often overlook that React client state is public, despite being treated as private. This leaves vulnerable:

- Customer records: Including personal information, purchase history, and preferences
- Direct messages: Private conversations that users assume are secure and confidential
- API Keys: Sensitive credentials that could grant unauthorized access to backend services and databases
- Twitter DMs: Personal and potentially sensitive messages on a major social media platform

State management libraries further expand this attack vector, potentially exposing even more data across various components and pages.

## State-Eating Chrome Extensions

A demonstration of how third parties might interact with your code:

### For Good

- BezRealitky: Helping build a better experience. Interacting with mapLib library. Showcase of Bytky for [BezRealitky](https://chromewebstore.google.com/detail/bytky-for-bezrealitky/ohdicifmaopdnncfjaghfapkeedalfin)

### For Bad

- Twitter/X. Performance optimization choices inadvertently expose users' direct messages to any installed browser extension and ... why am I hacking myself?

 Access customer details on Rohlik.cz, including names, addresses, card details, potentially exposing users to targeted phishing attacks or identity theft

- Demonstrate how to elevate user privileges to admin status on Rohlik.cz (for educational purposes only), highlighting the risks of insufficient access controls and why clientside is dangerous

- Rohlik Parents Club Client Side Workaround
- Rohlik Admin Product Discount
- ~Showcase how malicious actors could exploit this vulnerability to manipulate inventory, pricing, or user accounts, emphasizing the need for robust server-side validation~ Let's not do this.
- Illustrate how an extension could silently collect and exfiltrate private conversations, compromising user privacy on a massive scale

## What should you do when you discover this?

- Report it. Go above the first line and make a fuss. Expect to be met with distain.
- Showcase a demo and be explicit about the attack vector.
- Learn from it.

## Overcoming Lines of Defense

The sobering reality: there are few effective defenses against these attacks.

- Google's moderation can be circumvented through various tactics, including delayed malicious code injection
- Bribery and Google Employees - An Anecdote.
- Developers are the primary line of defense, responsible for implementing secure coding practices and thorough testing
- Self-hacking and curiosity are best security practices, encouraging developers to think like attackers to identify vulnerabilities
- GraphQL's approach serves as a positive example, demonstrating how to limit data exposure and implement proper access controls

## Next Steps

1. Apply these concepts to your own apps, conducting thorough security audits and penetration testing
2. Deepen your understanding of React (and other frameworks), focusing on security best practices and potential vulnerabilities
3. Engage in bug bounties to hone your skills and contribute to a more secure web ecosystem
4. Demand better security from trusted apps, holding developers and companies accountable for data protection
5. Use React responsibly, implementing security measures such as state encryption and access controls
6. Expect more from trusted platforms (e.g., Google), advocating for stricter vetting processes and ongoing security checks
7. Be mindful of stored state, regularly auditing what data is kept in client-side storage and for how long
8. Balance performance and security:
   - Only store what you intend to render, minimizing the attack surface for potential data theft
   - Question prefetching practices, especially with Next.js, considering the security implications of loading unnecessary data

Remember: With great power comes great responsibility. As developers, we must prioritize security alongside functionality and user experience.

## The Broader Implications

The Promptheus incident isn't just about one Chrome extension gone rogue. It highlights several critical issues in modern web development:

1. **Trust in the ecosystem**: How much can we rely on app stores and their vetting processes? This incident reveals potential gaps in the review and ongoing monitoring of published extensions.
2. **The double-edged sword of open-source**: While it drives innovation, it can also be exploited if not properly maintained. Open-source projects require ongoing security audits and community vigilance.
3. **The hidden costs of "free" services**: Users often pay with their data and privacy. This incident underscores the importance of understanding the true cost of seemingly free tools and services.
x

## Lessons for Developers

1. **Continuous monitoring**: Regularly check on your published work, even after you've moved on to new projects. Set up automated alerts for any unexpected changes or suspicious activity.
2. **Secure transfer of ownership**: If selling or transferring a project, ensure it's to a reputable party. Implement a thorough vetting process and consider gradual transfers of control.
3. **Fail-safes and kill switches**: Consider implementing mechanisms to disable functionality if suspicious activity is detected. This could include server-side checks or built-in expiration dates that require manual renewal.

## Call to Action

1. **Educate**: Share this story and its lessons with your team and the broader dev community. Organize workshops, write blog posts, and contribute to open discussions on web security.
2. **Innovate**: Develop new tools and practices to enhance web application security. This could include better state management libraries, security-focused linters, or browser extensions that detect vulnerable patterns.
3. **Advocate**: Push for better security standards in browsers, frameworks, and platforms. Engage with the developers of popular tools and frameworks to prioritize security features and best practices.
