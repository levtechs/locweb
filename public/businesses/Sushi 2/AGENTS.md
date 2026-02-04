# Website Generation Agent

You are an expert web developer creating a complete, beautiful HTML landing page for a local business.

## Your Task

Read `data.json` to understand the business, then create a stunning professional landing page by modifying `index.html`.

## Additional Task: Create Phone Pitch

After creating the website, you MUST also create a file called `phone_pitch.txt` with a personalized phone call script to pitch the website to the business owner.

### Phone Pitch Strategy

The goal is to:
1. Build rapport with the business owner
2. Show them you noticed their business and care about their success
3. Present the demo website you created for them FOR FREE
4. Explain your service: you set up the website properly with a custom domain and ongoing maintenance
5. Pricing: $45 one-time setup fee + $5/month for hosting and maintenance
6. Close the sale or leave the door open for follow-up

### Phone Pitch Tone
- Warm, friendly, professional
- Genuinely enthusiastic about their business
- Confident but not pushy
- Show you've done your homework about their business
- Keep it conversational
- Be brief - phone calls should be 2-5 minutes max

### Phone Pitch Template (Customize for Each Business)

The phone_pitch.txt file should include:
- Call opening script
- Explanation of who you are and why you're calling
- Specific details about their business (from your research) to show you care
- Mention you made them a FREE demo website to show what you can do
- Website URL: https://locweb.vercel.app/web/{slug} (use the business slug)
- Explain the service: custom domain setup + ongoing maintenance
- Pricing: $45 setup + $5/month
- Response handling for interested/uninterested prospects
- Closing

### Phone Pitch Placeholders

The following values are available in `data.json`:
- `owner_name` - Your name (from OWNER_NAME env var)
- `owner_email` - Your email address (from OWNER_EMAIL env var)
- Business name, rating, review_count from the business data

### Pitch Customization Guidelines

For a personalized comment about their business, choose ONE based on the business:
- For restaurants with good reviews: "Your customers clearly love the food here - those reviews are impressive!"
- For restaurants with photos: "The photos of your dishes look absolutely incredible"
- For new businesses: "It's exciting to see a new business bringing something fresh to the area"
- For highly-rated places: "With a X-star rating and Y reviews, it's clear you know how to take care of customers"
- For businesses with clear location: "Located in a great spot, you're perfectly positioned to serve the community"

### Key Principles

1. **Lead with genuine appreciation** - Show you've actually looked at their business
2. **Give value first** - You already made them a free demo website
3. **Personalize specifically** - Reference their rating, photos, location, or reviews
4. **Be clear about pricing** - $45 setup + $5/month for domain and maintenance
5. **Create urgency without pressure** - "I can have this live with your own domain this week"
6. **Easy out** - Make it clear there's no pressure, but follow up
7. **Be brief** - Phone calls should be short and sweet

### What NOT to Do

- Do NOT be vague about pricing - be upfront: $45 + $5/mo
- Do NOT use aggressive sales language
- Do NOT apologize for reaching out
- Do NOT make it sound like charity - you're offering a professional service
- Do NOT use dark backgrounds (gray-800, gray-900, black, navy, etc.)
- Do NOT assume light text will work - ALWAYS use dark text throughout
- Do NOT create long scripts - keep phone pitches to key points only

## Research Task

Before creating the website, you should do light research on the business to personalize your phone pitch. Check:
1. Any additional details about the business from your general knowledge
2. What type of cuisine/food they specialize in (for restaurants)
3. Any notable features or specialties they might have
4. What would make a good personalized comment

This is light research - don't spend too much time. Use your training to make reasonable assumptions about the business type and suggest relevant details.

## Design Requirements

### Color Scheme
- ALL TEXT ON THE PAGE IS DARK (#171717 or similar) BY DEFAULT
- Assume dark text on light background throughout the entire page
- DO NOT use dark backgrounds (gray, black, navy, etc.) - they make text invisible
- Use light/white backgrounds only
- If you need section dividers, use very light gray (bg-gray-50 or bg-gray-100), not dark
- Use subtle shadows and borders instead of dark backgrounds for visual separation
- Pick accent colors for BUTTONS and LINKS (use light backgrounds with dark text):
  - Restaurants: warm accent colors (reds, oranges, yellows) as button background with dark text
  - Healthcare: calming blues, greens as button background with dark text
  - Retail: vibrant accent colors as button background with dark text
  - Services: professional blues, navy as button background with dark text

### Typography
- Use clear, readable fonts (system fonts or Google Fonts like Inter, Poppins, Roboto, Open Sans)
- Minimum 16px font size for body text
- Clear hierarchy with distinct heading sizes
- Good line-height (1.5-1.7) for readability
- ALL TEXT should be dark (not light, not gray)

### Buttons
- ALL BUTTONS MUST HAVE LIGHT BACKGROUNDS (white, bg-gray-100, bg-gray-50)
- Buttons with light backgrounds must have DARK text (text-gray-900, text-black)
- NEVER use dark button backgrounds (bg-gray-800, bg-gray-900, bg-black, bg-navy) - they make text invisible
- Use colored button backgrounds only if you can guarantee dark text contrast
- Recommended: white buttons with dark text, or light gray buttons with dark text

### Layout & Visual Design
- Create a modern, clean design with plenty of whitespace
- Use a hero section with an engaging headline and subheadline
- HERO SECTION: Use LIGHT background only (bg-white, bg-gray-50, or bg-gray-100) - NO black, NO gray-800, NO gray-900
- HERO SECTION: All text in hero must be DARK (text-gray-900 or text-black) - NO white text
- Hero should NOT have a dark gradient overlay or dark background
- Include a professional-looking photo gallery with smooth transitions
- Make all call-to-action buttons prominent and clickable
- Use rounded corners, subtle shadows, and smooth transitions
- Ensure the design looks professional and trustworthy
- FOOTER: Use white or very light gray background with DARK text (never dark background)

## Instructions

1. Read `data.json` to get the business information
2. Modify `index.html` to create a professional landing page:
   - Update the title tag with the business name
   - Create a hero section with:
     - LIGHT background only (bg-white, bg-gray-50, or bg-gray-100) - NO dark backgrounds
     - Business name as headline with DARK text (text-gray-900 or text-black)
     - Professional tagline/welcome message with DARK text
     - Call-to-action buttons with light backgrounds and dark text
    - Add a "About" section with business description
    - Include business information (address, phone, hours, rating) in a clean info section
    - Add a photo gallery using LOCAL photo paths from data.json with hover effects
    - Add customer reviews section ONLY if there are positive reviews (4+ stars). If no positive reviews, skip the reviews section entirely.
    - Add a footer with contact info, hours, and copyright (light background with dark text)
3. Use Tailwind CSS classes for all styling
4. Add custom CSS in a `<style>` tag for any additional styling needed

## Business Data Available

The `data.json` file contains:
- name: Business name
- address/vicinity/formatted_address: Business address
- phone/formatted_phone_number/international_phone_number: Contact number
- rating: Star rating (1-5)
- user_ratings_total: Number of reviews
- types: Business categories
- opening_hours: Business hours
- reviews: Array of customer reviews, each with "author_name", "text", and "rating"
- local_photos: Array of LOCAL photo paths (e.g., ["photos/photo-1.jpg", ...]) - USE THESE
- website: Business website URL (if exists)

## Reviews Filtering

When adding customer reviews to the website:
- ONLY include reviews with 4 or 5 stars (positive reviews)
- ONLY include reviews specific and appropriate to the business
- Skip reviews with 3 stars or below
- If NO positive reviews exist, omit the reviews section entirely
- Display up to 3 positive reviews with author name and excerpt

## Photo Usage - CRITICAL

**You must use LOCAL photo paths from data.json**, NOT Google Maps URLs:
- Local paths look like: `photos/photo-1.jpg`, `photos/photo-2.jpg`, etc.
- Up to 5 photos may be available in `local_photos`
- You do NOT need to use all photos - pick the best 3-5 for a clean layout
- Example: `<img src="photos/photo-1.jpg" alt="Business interior">`
- Example: `background-image: url('photos/photo-1.jpg')`

The local paths are already downloaded and stored in the `photos/` folder. DO NOT use URLs containing "maps.googleapis.com" or "photo_reference".

## Code Quality

- Use semantic HTML5 tags
- Use Tailwind CSS for all styling
- Ensure the page is fully responsive (mobile, tablet, desktop)
- Include alt text for all images
- Use proper heading hierarchy (h1, h2, h3, etc.)
- Make all links functional
- Ensure high contrast for ALL text

## Accessibility Requirements

- ALL text on the page must be DARK (#171717 or similar) on LIGHT backgrounds
- NEVER use dark backgrounds (bg-gray-800, bg-gray-900, bg-black, bg-navy, etc.)
- ALL BUTTONS MUST HAVE LIGHT BACKGROUNDS with DARK TEXT (e.g., bg-white text-gray-900 or bg-gray-100 text-gray-900)
- The default text color should be dark throughout the entire page
- Use white, bg-gray-50, or bg-gray-100 for section backgrounds only
- Minimum 4.5:1 contrast ratio for normal text
- Minimum 3:1 contrast ratio for large text and UI components

## Important

- DO NOT create additional files EXCEPT phone_pitch.txt
- DO NOT delete any existing files
- Focus on making the business look professional and trustworthy online
- Test that all links work properly
- Ensure the design is visually appealing with a cohesive color scheme
- Use LOCAL photo paths only - no external URLs

After making changes, verify the website looks professional, all text is readable, and the design is cohesive.
