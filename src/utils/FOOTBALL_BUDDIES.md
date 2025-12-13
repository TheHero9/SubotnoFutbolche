# Football Buddies Algorithm

This document explains the algorithms used to find "football buddies" - players who play together most often.

## The Problem

The naive approach of counting raw game overlaps has a significant flaw: **frequent players dominate everyone's list**.

For example, if Dimi plays 40 out of 48 games, he will appear in almost everyone's "top players" list simply because he's at most games - not because of any special connection.

## The Solution: Affinity Score (Lift Metric)

We use an **affinity score** based on the statistical "lift" metric from recommendation systems.

### Formula

```
Affinity = Actual Overlap / Expected Overlap

Where:
  Expected Overlap = (Your Games × Their Games) / Total Game Days
```

### What This Measures

- **Affinity > 1**: You play together MORE than random chance would predict
- **Affinity = 1**: You play together exactly as expected by chance
- **Affinity < 1**: You play together LESS than random chance would predict

### Example

**Scenario:**
- Total game days in 2025: 48
- Dimi: 40 games
- Player A: 8 games
- Player B: 10 games

**From Player A's perspective:**

With Dimi (frequent player):
- Actual overlap: ~7 games (Dimi is at most games)
- Expected: (8 × 40) / 48 = 6.67
- Affinity: 7 / 6.67 = **1.05** (just average)

With Player B (similar attendance):
- Actual overlap: 5 games
- Expected: (8 × 10) / 48 = 1.67
- Affinity: 5 / 1.67 = **3.0** (high!)

**Result:** Player B ranks higher as a "buddy" because they show up when Player A shows up more than chance would predict.

## Additional Metric: Influence

We also calculate **influence** - what percentage of THEIR games you were part of.

```
Influence = (Games Together / Their Total Games) × 100
```

### Example

- You played 40 games
- They played 8 games
- You played together 6 times

**Your influence on them:** 6/8 = 75%
(You were at 75% of their games - you're a cornerstone for them!)

**Their influence on you:** 6/40 = 15%
(They were at only 15% of your games)

This shows the **asymmetric relationship** - who is more "important" to whom.

## Sorting Logic

Buddies are sorted by:
1. **Affinity** (primary) - finds genuine connections
2. **Influence** (secondary) - breaks ties by showing who relies on you
3. **Games together** (tertiary) - final tiebreaker

## Thresholds

To avoid noise from small sample sizes:

- **Minimum games for stats:** 3 (player must have at least 3 games)
- **Minimum overlap:** 2 (must have played together at least twice)
- **Minimum their games:** 2 (the other player must have at least 2 games)

## Functions

### `getFootballBuddies(player, allPlayers)`

Returns top 5 players sorted by affinity score. Best for finding "who do I play with most?"

### `getPlayersYouInfluence(player, allPlayers)`

Returns top 5 players sorted by influence percentage. Best for finding "who relies on my attendance?"

## Visual Display

The UI shows:
1. Player name
2. Games played together
3. Influence percentage (what % of their games you were at)

Example:
```
🤝 Your Football Buddies

1. Ivan      6 games  (75% of his games)
2. Petar     5 games  (50% of his games)
3. Georgi    4 games  (40% of his games)
```

This clearly shows both the connection strength AND your importance to that player.
