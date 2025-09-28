const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Routes
app.get('/api/contests', async (req, res) => {
    const apis = [
        {
            name: 'Codeforces',
            url: 'https://codeforces.com/api/contest.list',
            options: {
                headers: {
                    'Accept': 'application/json',
                    'User-Agent': 'Contest-Aggregator/1.0'
                }
            },
            transform: (data) => {
                return data.result.map(contest => ({
                    name: contest.name,
                    url: `https://codeforces.com/contest/${contest.id}`,
                    start_time: new Date(contest.startTimeSeconds * 1000).toISOString(),
                    duration: contest.durationSeconds,
                    site: 'Codeforces',
                    status: contest.phase === 'BEFORE' ? 'BEFORE' : 'CODING'
                }));
            }
        },
        {
            name: 'LeetCode',
            url: 'https://leetcode.com/graphql',
            options: {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'User-Agent': 'Mozilla/5.0',
                    'Origin': 'https://leetcode.com',
                    'Referer': 'https://leetcode.com/contest/'
                },
                body: JSON.stringify({
                    query: `{
                        allContests {
                            title
                            titleSlug
                            startTime
                            duration
                            status
                        }
                    }`
                })
            },
            transform: (data) => {
                return (data.data?.allContests || []).map(contest => ({
                    name: contest.title,
                    url: `https://leetcode.com/contest/${contest.titleSlug}`,
                    start_time: new Date(contest.startTime * 1000).toISOString(),
                    duration: contest.duration,
                    site: 'LeetCode',
                    status: contest.status === 'NOT_START' ? 'BEFORE' : 'CODING'
                }));
            }
        },
        {
            name: 'CodeChef',
            url: 'https://www.codechef.com/api/list/contests/all?sort_by=START&sorting_order=asc',
            options: {
                headers: {
                    'Accept': 'application/json',
                    'User-Agent': 'Mozilla/5.0'
                }
            },
            transform: (data) => {
                return (data.future_contests || []).map(contest => ({
                    name: contest.contest_name,
                    url: `https://www.codechef.com/${contest.contest_code}`,
                    start_time: new Date(contest.contest_start_date).toISOString(),
                    duration: contest.contest_duration * 60 * 60,
                    site: 'CodeChef',
                    status: 'BEFORE'
                }));
            }
        },
        {
            name: 'HackerRank',
            url: 'https://www.hackerrank.com/rest/contests/upcoming?offset=0&limit=10',
            transform: (data) => {
                return data.models.map(contest => ({
                    name: contest.name,
                    url: `https://www.hackerrank.com/contests/${contest.slug}`,
                    start_time: new Date(contest.get_starttimeiso).toISOString(),
                    duration: contest.duration,
                    site: 'HackerRank',
                    status: 'BEFORE'
                }));
            }
        }
    ];

    let allContests = [];

    await Promise.all(apis.map(async (api) => {
        try {
            console.log(`Fetching from ${api.name}...`);
            const response = await fetch(api.url, {
                ...api.options,
                timeout: 10000
            });

            if (!response.ok) {
                throw new Error(`${api.name} API error: ${response.status}`);
            }

            const data = await response.json();
            const transformedData = api.transform(data);
            console.log(`${api.name} contests found:`, transformedData.length);
            allContests = [...allContests, ...transformedData];
        } catch (error) {
            console.error(`Failed to fetch from ${api.name}:`, error.message);
        }
    }));

    const formattedContests = allContests
        .filter(contest => contest.status === 'BEFORE')
        .sort((a, b) => new Date(a.start_time) - new Date(b.start_time));

    console.log('Total contests after filtering:', formattedContests.length);

    // ✅ Always respond with JSON (never throw)
    res.json({
        success: true,
        contests: formattedContests,
        fetchedCount: formattedContests.length
    });
});

// Start server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
}).on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
        console.error(`Port ${port} is already in use. Try a different port.`);
        process.exit(1);
    } else {
        console.error('Server error:', err);
    }
});
