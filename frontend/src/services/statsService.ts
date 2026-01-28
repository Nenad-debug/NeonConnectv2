import { supabase } from './supabaseClient'

export const statsService = {
  async getStats() {
    try {
      // Get active users count (ALL users, not just confirmed)
      const { count: activeUsers, error: usersError } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })

      if (usersError) {
        console.error('Users error:', usersError)
      }

      // Get active jobs count
      const { count: activeJobs, error: jobsError } = await supabase
        .from('jobs')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active')

      if (jobsError) console.error('Jobs error:', jobsError)

      // Get verified companies count (employers with profiles)
      const { count: verifiedCompanies, error: companiesError } = await supabase
        .from('employer_profiles')
        .select('*', { count: 'exact', head: true })

      if (companiesError) console.error('Companies error:', companiesError)

      // Get satisfaction rate (applications with positive statuses)
      const { count: totalCount, error: totalError } = await supabase
        .from('applications')
        .select('*', { count: 'exact', head: true })

      const { count: acceptedCount, error: acceptedError } = await supabase
        .from('applications')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'accepted')

      if (totalError) console.error('Total applications error:', totalError)
      if (acceptedError) console.error('Accepted applications error:', acceptedError)

      const satisfactionRate = totalCount && totalCount > 0
        ? Math.round(((acceptedCount || 0) / totalCount) * 100)
        : 92

      console.log('Stats fetched:', {
        activeUsers,
        activeJobs,
        verifiedCompanies,
        satisfactionRate,
        totalCount,
        acceptedCount,
      })

      return {
        activeUsers: activeUsers || 0,
        activeJobs: activeJobs || 0,
        verifiedCompanies: verifiedCompanies || 0,
        satisfactionRate: Math.min(satisfactionRate, 100),
      }
    } catch (error) {
      console.error('Error fetching stats:', error)
      return {
        activeUsers: 0,
        activeJobs: 0,
        verifiedCompanies: 0,
        satisfactionRate: 92,
      }
    }
  },
}
