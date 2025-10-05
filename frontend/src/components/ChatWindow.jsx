import { useState, useEffect, useRef } from 'react'
import { useAuth0 } from '@auth0/auth0-react'

function ChatWindow() {
  const { user } = useAuth0()
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [hasStarted, setHasStarted] = useState(false)
  const [step, setStep] = useState('welcome')
  const [householdMembers, setHouseholdMembers] = useState([])
  const [pendingMember, setPendingMember] = useState(null)
  const [pendingIncome, setPendingIncome] = useState(null)
  const messagesEndRef = useRef(null)

  const [formData, setFormData] = useState({
    meta: {
      state: null,
      language: 'en',
      timestamp_iso: null,
      notes: null,
    },
    applicant: {
      full_name: null,
      dob: null,
      phone: null,
      email: user?.email || null,
      residential_address: {
        street: null,
        unit: null,
        city: null,
        state: null,
        zip: null,
      },
      mailing_address_same: true,
      mailing_address: null,
      ssn_last4: null,
      citizenship_status: null,
      disability: null,
      student_status: null,
      veteran_status: null,
    },
    household: {
      size: null,
      members: [],
    },
    income: [],
    expenses: {
      housing: {
        rent_or_mortgage: { amount: null, frequency: null },
        pays_utilities: [],
      },
      child_or_adult_care: [],
      medical_elderly_disabled: [],
    },
    assets: {
      cash_on_hand: null,
      checking: null,
      savings: null,
      vehicles: [],
    },
    work_activity: {
      is_student: null,
      is_in_training: null,
      recent_job_loss: null,
    },
    declarations: {
      consent_to_share: null,
      attestation_reviewed: null,
    },
  })

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const speak = (text) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.rate = 0.95
      utterance.pitch = 1
      window.speechSynthesis.speak(utterance)
    }
  }

  const ask = (text) => {
    const aiMessage = { sender: 'ai', message: text, timestamp: new Date() }
    setMessages((prev) => [...prev, aiMessage])
    speak(text)
  }

  const startApplication = async () => {
    setHasStarted(true)
    ask(
      "I can help prepare answers for your SNAP application. I'll ask short questions and you can skip anything. I can’t decide eligibility. I’ll help collect answers for your application. Shall we begin? (yes/no)"
    )
    setStep('consent')
  }

  const isValidStateCode = (value) => /^[A-Za-z]{2}$/.test(value)
  const isValidDate = (value) => /^\d{4}-\d{2}-\d{2}$/.test(value)
  const isValidEmail = (value) => /.+@.+\..+/.test(value)
  const isValidPhone = (value) => /^(\+?1[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}$/.test(value)

  const parseMoneyFrequency = (value) => {
    const trimmed = value.trim().toLowerCase()
    const freqMatch = trimmed.match(/(hourly|weekly|biweekly|monthly|yearly)/)
    const amountMatch = trimmed.match(/\$?\s*([0-9]+(?:\.[0-9]{1,2})?)/)
    return {
      amount: amountMatch ? parseFloat(amountMatch[1]) : null,
      frequency: freqMatch ? freqMatch[1] : null,
    }
  }

  const maskLast4 = (value) => (value && /\d{4}/.test(value) ? `-*-${value.slice(-4)}` : null)

  const nextAfter = (delayMs, text, nextStep) => {
    setIsLoading(true)
    setTimeout(() => {
      ask(text)
      setStep(nextStep)
      setIsLoading(false)
    }, delayMs)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!input.trim()) return

    const userText = input.trim()
    const userMessage = { sender: 'user', message: userText, timestamp: new Date() }
    setMessages((prev) => [...prev, userMessage])
    setInput('')

    // Normalize control words
    const lower = userText.toLowerCase()
    const didSkip = ['skip', "don't know", 'dont know', 'later'].includes(lower)

    switch (step) {
      case 'consent': {
        if (lower.startsWith('y')) {
          setFormData((d) => ({
            ...d,
            declarations: { ...d.declarations, consent_to_share: true },
          }))
          nextAfter(
            200,
            "Great. Forms vary by state; I’ll collect the common info and flag any state-specific items if needed. First, what state do you live in? Please use a 2-letter code (e.g., TX).",
            'state'
          )
        } else {
          ask('No problem. You can start anytime by typing "start".')
          setStep('welcome')
        }
        break
      }
      case 'welcome': {
        if (lower === 'start') {
          nextAfter(
            200,
            "Forms vary by state; I’ll collect the common info and flag any state-specific items if needed. What state do you live in? (2-letter code, e.g., TX)",
            'state'
          )
        } else {
          ask('Type "start" when you are ready.')
        }
        break
      }
      case 'state': {
        if (didSkip) {
          setFormData((d) => ({ ...d, meta: { ...d.meta, state: null } }))
        } else if (!isValidStateCode(userText)) {
          ask('Please enter your state as a 2-letter code, like TX or CA. You can also type "skip".')
          break
        } else {
          const stateCode = userText.toUpperCase()
          setFormData((d) => ({
            ...d,
            meta: { ...d.meta, state: stateCode },
            applicant: {
              ...d.applicant,
              residential_address: { ...d.applicant.residential_address, state: stateCode },
            },
          }))
          ask('Thanks, recorded.')
        }
        nextAfter(
          200,
          'What language do you prefer for this conversation? (e.g., en, es).',
          'language'
        )
        break
      }
      case 'language': {
        const lang = didSkip ? 'en' : userText.toLowerCase()
        setFormData((d) => ({ ...d, meta: { ...d.meta, language: lang } }))
        nextAfter(
          200,
          'Any accessibility needs I should keep in mind? (e.g., larger text, slower pace). You can type "skip".',
          'accessibility'
        )
        break
      }
      case 'accessibility': {
        if (!didSkip) {
          setFormData((d) => ({ ...d, meta: { ...d.meta, notes: userText } }))
        }
        nextAfter(
          200,
          'Household basics. What is your full name as it appears on your ID?',
          'applicant_full_name'
        )
        break
      }
      case 'applicant_full_name': {
        if (didSkip) {
          setFormData((d) => ({ ...d, applicant: { ...d.applicant, full_name: null } }))
        } else {
          setFormData((d) => ({ ...d, applicant: { ...d.applicant, full_name: userText } }))
          ask('Thanks, recorded.')
        }
        nextAfter(
          200,
          'What is your date of birth? (YYYY-MM-DD). You can type "skip".',
          'applicant_dob'
        )
        break
      }
      case 'applicant_dob': {
        if (didSkip) {
          setFormData((d) => ({ ...d, applicant: { ...d.applicant, dob: null } }))
        } else if (!isValidDate(userText)) {
          ask('Please enter your date as YYYY-MM-DD, for example 1990-05-21. Or type "skip".')
          break
        } else {
          setFormData((d) => ({ ...d, applicant: { ...d.applicant, dob: userText } }))
          ask('Thanks, recorded.')
        }
        nextAfter(
          200,
          'What is the best phone number to reach you? (You can type "skip").',
          'contact_phone'
        )
        break
      }
      case 'contact_phone': {
        if (didSkip) {
          setFormData((d) => ({ ...d, applicant: { ...d.applicant, phone: null } }))
        } else if (!isValidPhone(userText)) {
          ask('Please enter a 10-digit phone number (e.g., 555-123-4567). Or type "skip".')
          break
        } else {
          setFormData((d) => ({ ...d, applicant: { ...d.applicant, phone: userText } }))
          ask('Thanks, recorded.')
        }
        nextAfter(
          200,
          'What email should we use? (example: name@example.com). You can type "skip".',
          'contact_email'
        )
        break
      }
      case 'contact_email': {
        if (didSkip) {
          // keep existing user email if present
        } else if (!isValidEmail(userText)) {
          ask('That email looks off. Please enter a valid email like name@example.com, or type "skip".')
          break
        } else {
          setFormData((d) => ({ ...d, applicant: { ...d.applicant, email: userText } }))
          ask('Thanks, recorded.')
        }
        nextAfter(
          200,
          'Residential address: What is your street address? (You can type "skip".)',
          'addr_street'
        )
        break
      }
      case 'addr_street': {
        if (!didSkip) {
          setFormData((d) => ({
            ...d,
            applicant: {
              ...d.applicant,
              residential_address: { ...d.applicant.residential_address, street: userText },
            },
          }))
        }
        nextAfter(200, 'Apartment/unit (if any)? You can type "skip".', 'addr_unit')
        break
      }
      case 'addr_unit': {
        if (!didSkip) {
          setFormData((d) => ({
            ...d,
            applicant: {
              ...d.applicant,
              residential_address: { ...d.applicant.residential_address, unit: userText },
            },
          }))
        }
        nextAfter(200, 'City?', 'addr_city')
        break
      }
      case 'addr_city': {
        if (!didSkip) {
          setFormData((d) => ({
            ...d,
            applicant: {
              ...d.applicant,
              residential_address: { ...d.applicant.residential_address, city: userText },
            },
          }))
        }
        const st = formData.meta.state || 'state'
        nextAfter(200, `State (default ${st})? Type the 2-letter code or "skip".`, 'addr_state')
        break
      }
      case 'addr_state': {
        if (didSkip) {
          // use meta.state as default if available
          setFormData((d) => ({
            ...d,
            applicant: {
              ...d.applicant,
              residential_address: { ...d.applicant.residential_address, state: d.meta.state },
            },
          }))
        } else if (!isValidStateCode(userText)) {
          ask('Please enter a 2-letter state code (e.g., TX) or type "skip".')
          break
        } else {
          setFormData((d) => ({
            ...d,
            applicant: {
              ...d.applicant,
              residential_address: { ...d.applicant.residential_address, state: userText.toUpperCase() },
            },
          }))
        }
        nextAfter(200, 'ZIP code? (5 digits) You can type "skip".', 'addr_zip')
        break
      }
      case 'addr_zip': {
        if (!didSkip) {
          if (!/^\d{5}$/.test(userText)) {
            ask('Please enter a 5-digit ZIP code or type "skip".')
            break
          }
          setFormData((d) => ({
            ...d,
            applicant: {
              ...d.applicant,
              residential_address: { ...d.applicant.residential_address, zip: userText },
            },
          }))
        }
        nextAfter(200, 'Is your mailing address the same as residential? (yes/no)', 'mail_same')
        break
      }
      case 'mail_same': {
        const same = lower.startsWith('y') || didSkip
        setFormData((d) => ({ ...d, applicant: { ...d.applicant, mailing_address_same: same } }))
        if (same) {
          nextAfter(200, 'Household size: How many people live with you including you?', 'hh_size')
        } else {
          nextAfter(200, 'Mailing address street?', 'mail_street')
        }
        break
      }
      case 'mail_street': {
        setFormData((d) => ({
          ...d,
          applicant: {
            ...d.applicant,
            mailing_address: {
              ...(d.applicant.mailing_address || {}),
              street: didSkip ? null : userText,
            },
          },
        }))
        nextAfter(200, 'Mailing unit (if any)? You can type "skip".', 'mail_unit')
        break
      }
      case 'mail_unit': {
        setFormData((d) => ({
          ...d,
          applicant: {
            ...d.applicant,
            mailing_address: {
              ...(d.applicant.mailing_address || {}),
              unit: didSkip ? null : userText,
            },
          },
        }))
        nextAfter(200, 'Mailing city?', 'mail_city')
        break
      }
      case 'mail_city': {
        setFormData((d) => ({
          ...d,
          applicant: {
            ...d.applicant,
            mailing_address: {
              ...(d.applicant.mailing_address || {}),
              city: didSkip ? null : userText,
            },
          },
        }))
        nextAfter(200, 'Mailing state? (2-letter) You can type "skip".', 'mail_state')
        break
      }
      case 'mail_state': {
        setFormData((d) => ({
          ...d,
          applicant: {
            ...d.applicant,
            mailing_address: {
              ...(d.applicant.mailing_address || {}),
              state: didSkip ? null : userText.toUpperCase(),
            },
          },
        }))
        nextAfter(200, 'Mailing ZIP? (5 digits) You can type "skip".', 'mail_zip')
        break
      }
      case 'mail_zip': {
        if (!didSkip && !/^\d{5}$/.test(userText)) {
          ask('Please enter a 5-digit ZIP or type "skip".')
          break
        }
        setFormData((d) => ({
          ...d,
          applicant: {
            ...d.applicant,
            mailing_address: {
              ...(d.applicant.mailing_address || {}),
              zip: didSkip ? null : userText,
            },
          },
        }))
        nextAfter(200, 'Household size: How many people live with you including you?', 'hh_size')
        break
      }
      case 'hh_size': {
        const num = parseInt(userText, 10)
        if (didSkip) {
          setFormData((d) => ({ ...d, household: { ...d.household, size: null } }))
        } else if (Number.isNaN(num) || num <= 0 || num > 20) {
          ask('Please enter a number between 1 and 20, or type "skip".')
          break
        } else {
          setFormData((d) => ({ ...d, household: { ...d.household, size: num } }))
        }
        nextAfter(
          200,
          'Let’s list household members (besides you). Do you want to add one now? (yes/no)',
          'hh_add_member_check'
        )
        break
      }
      case 'hh_add_member_check': {
        if (lower.startsWith('y')) {
          setPendingMember({ full_name: null, relationship: null, dob: null })
          nextAfter(200, 'Member full name?', 'hh_member_name')
        } else {
          nextAfter(
            200,
            'Identity & status questions can be optional. Would you like to answer them? (yes/no)',
            'identity_opt_in'
          )
        }
        break
      }
      case 'hh_member_name': {
        setPendingMember((m) => ({ ...(m || {}), full_name: didSkip ? null : userText }))
        nextAfter(200, 'Relationship to you? (spouse/child/other). You can type "skip".', 'hh_member_rel')
        break
      }
      case 'hh_member_rel': {
        setPendingMember((m) => ({ ...(m || {}), relationship: didSkip ? null : userText.toLowerCase() }))
        nextAfter(200, 'Member date of birth? (YYYY-MM-DD). You can type "skip".', 'hh_member_dob')
        break
      }
      case 'hh_member_dob': {
        if (!didSkip && !isValidDate(userText)) {
          ask('Please enter as YYYY-MM-DD or type "skip".')
          break
        }
        const newMember = { ...(pendingMember || {}), dob: didSkip ? null : userText }
        const nextMembers = [...householdMembers, newMember]
        setHouseholdMembers(nextMembers)
        setFormData((d) => ({ ...d, household: { ...d.household, members: nextMembers } }))
        const names = nextMembers.map((m) => m.full_name).filter(Boolean).join(', ') || 'None yet'
        ask(`Current household members: ${names}`)
        nextAfter(200, 'Add another household member? (yes/no)', 'hh_add_member_check')
        break
      }
      case 'identity_opt_in': {
        if (lower.startsWith('y')) {
          nextAfter(200, 'Last 4 of SSN? (optional) You can type "skip".', 'id_ssn_last4')
        } else {
          nextAfter(200, 'Income. Are you currently employed? (yes/no)', 'inc_employed_check')
        }
        break
      }
      case 'id_ssn_last4': {
        if (!didSkip && !/^\d{4}$/.test(userText)) {
          ask('Please enter just the last 4 digits (e.g., 1234), or type "skip".')
          break
        }
        setFormData((d) => ({ ...d, applicant: { ...d.applicant, ssn_last4: didSkip ? null : maskLast4(userText) } }))
        nextAfter(
          200,
          'Citizenship/immigration status? (us_citizen | lpr | other | undisclosed)',
          'id_citizenship'
        )
        break
      }
      case 'id_citizenship': {
        const allowed = ['us_citizen', 'lpr', 'other', 'undisclosed']
        const val = didSkip ? 'undisclosed' : userText.toLowerCase()
        if (!allowed.includes(val)) {
          ask('Please reply with: us_citizen | lpr | other | undisclosed')
          break
        }
        setFormData((d) => ({ ...d, applicant: { ...d.applicant, citizenship_status: val } }))
        nextAfter(200, 'Are you a student? (yes/no/skip)', 'id_student')
        break
      }
      case 'id_student': {
        const val = didSkip ? null : lower.startsWith('y')
        setFormData((d) => ({ ...d, applicant: { ...d.applicant, student_status: val } }))
        nextAfter(200, 'Do you have a disability? (yes/no/skip)', 'id_disability')
        break
      }
      case 'id_disability': {
        const val = didSkip ? null : lower.startsWith('y')
        setFormData((d) => ({ ...d, applicant: { ...d.applicant, disability: val } }))
        nextAfter(200, 'Are you a veteran? (yes/no/skip)', 'id_veteran')
        break
      }
      case 'id_veteran': {
        const val = didSkip ? null : lower.startsWith('y')
        setFormData((d) => ({ ...d, applicant: { ...d.applicant, veteran_status: val } }))
        nextAfter(200, 'Income. Are you currently employed? (yes/no)', 'inc_employed_check')
        break
      }
      case 'inc_employed_check': {
        if (lower.startsWith('y')) {
          setPendingIncome({ person: 'Applicant', type: 'employment', employer_or_source: null, gross_amount: null, frequency: null, hours_per_week: null, start_date: null })
          nextAfter(200, 'Employer name?', 'inc_employer')
        } else {
          nextAfter(200, 'Any other income to report? (unemployment, child support, SSI, etc.) (yes/no)', 'inc_other_check')
        }
        break
      }
      case 'inc_employer': {
        setPendingIncome((i) => ({ ...(i || {}), employer_or_source: didSkip ? null : userText }))
        nextAfter(200, 'About how much do you earn before taxes, and how often? (e.g., $600 weekly)', 'inc_amount_freq')
        break
      }
      case 'inc_amount_freq': {
        const { amount, frequency } = didSkip ? { amount: null, frequency: null } : parseMoneyFrequency(userText)
        if (!didSkip && (!amount || !frequency)) {
          ask('Please include amount and frequency like "$600 weekly". Or type "skip".')
          break
        }
        setPendingIncome((i) => ({ ...(i || {}), gross_amount: amount, frequency }))
        nextAfter(200, 'How many hours per week? (e.g., 35) You can type "skip".', 'inc_hours')
        break
      }
      case 'inc_hours': {
        const hours = didSkip ? null : parseInt(userText, 10)
        if (!didSkip && (Number.isNaN(hours) || hours < 0 || hours > 80)) {
          ask('Please enter a number between 0 and 80, or type "skip".')
          break
        }
        setPendingIncome((i) => ({ ...(i || {}), hours_per_week: hours }))
        nextAfter(200, 'When did this job start? (YYYY-MM-DD) You can type "skip".', 'inc_start')
        break
      }
      case 'inc_start': {
        if (!didSkip && !isValidDate(userText)) {
          ask('Please enter YYYY-MM-DD or type "skip".')
          break
        }
        setPendingIncome((i) => ({ ...(i || {}), start_date: didSkip ? null : userText }))
        // commit income
        setFormData((d) => ({ ...d, income: [...d.income, { ...(pendingIncome || {}) }] }))
        nextAfter(200, 'Add another job or income item? (yes/no)', 'inc_add_more')
        break
      }
      case 'inc_other_check': {
        if (lower.startsWith('y')) {
          setPendingIncome({ person: 'Applicant', type: 'other', employer_or_source: null, gross_amount: null, frequency: null })
          nextAfter(200, 'What is the income source? (e.g., unemployment, child_support, ssi, ssdi, pension, other)', 'inc_source')
        } else {
          nextAfter(200, 'Housing costs help eligibility. What is your rent or mortgage amount and how often? (e.g., $1200 monthly)', 'exp_housing_amount')
        }
        break
      }
      case 'inc_source': {
        const allowed = ['employment', 'self_employment', 'unemployment', 'social_security', 'ssi', 'ssdi', 'child_support', 'pension', 'other']
        const v = didSkip ? 'other' : userText.toLowerCase().replace(/\s+/g, '_')
        if (!allowed.includes(v)) {
          ask('Please choose one: employment | self_employment | unemployment | social_security | ssi | ssdi | child_support | pension | other')
          break
        }
        setPendingIncome((i) => ({ ...(i || {}), type: v, employer_or_source: v }))
        nextAfter(200, 'Amount and frequency? (e.g., $300 monthly)', 'inc_amount_freq')
        break
      }
      case 'inc_add_more': {
        if (lower.startsWith('y')) {
          nextAfter(200, 'Is it employment? (yes for job / no for other income)', 'inc_employed_check')
        } else {
          nextAfter(200, 'Which utilities do you pay directly? List any: electric, gas, heating, water, phone, internet. Or type "skip".', 'exp_utilities')
        }
        break
      }
      case 'exp_housing_amount': {
        const { amount, frequency } = didSkip ? { amount: null, frequency: null } : parseMoneyFrequency(userText)
        if (!didSkip && (!amount || !frequency)) {
          ask('Please include amount and frequency like "$1200 monthly". Or type "skip".')
          break
        }
        setFormData((d) => ({
          ...d,
          expenses: {
            ...d.expenses,
            housing: { ...d.expenses.housing, rent_or_mortgage: { amount, frequency } },
          },
        }))
        nextAfter(200, 'Which utilities do you pay directly? (electric, gas, heating, water, phone, internet). You can list any, or type "skip".', 'exp_utilities')
        break
      }
      case 'exp_utilities': {
        const utils = didSkip
          ? []
          : userText
              .toLowerCase()
              .split(/[,;]+/)
              .map((s) => s.trim())
              .filter(Boolean)
        setFormData((d) => ({
          ...d,
          expenses: { ...d.expenses, housing: { ...d.expenses.housing, pays_utilities: utils } },
        }))
        nextAfter(200, 'Any childcare or adult care expenses? (yes/no)', 'exp_care_check')
        break
      }
      case 'exp_care_check': {
        if (lower.startsWith('y')) {
          nextAfter(200, 'Who is this expense for? (name).', 'exp_care_for')
        } else {
          nextAfter(200, 'Medical expenses for elderly/disabled members? (yes/no)', 'exp_med_check')
        }
        break
      }
      case 'exp_care_for': {
        setPendingIncome(null)
        setPendingMember({ person: didSkip ? null : userText })
        nextAfter(200, 'Amount and frequency? (e.g., $300 monthly)', 'exp_care_amount')
        break
      }
      case 'exp_care_amount': {
        const { amount, frequency } = didSkip ? { amount: null, frequency: null } : parseMoneyFrequency(userText)
        if (!didSkip && (!amount || !frequency)) {
          ask('Please include amount and frequency like "$300 monthly". Or type "skip".')
          break
        }
        setFormData((d) => ({
          ...d,
          expenses: {
            ...d.expenses,
            child_or_adult_care: [
              ...d.expenses.child_or_adult_care,
              { person: pendingMember?.person || 'Household Member', amount, frequency },
            ],
          },
        }))
        nextAfter(200, 'Any other care expenses to add? (yes/no)', 'exp_care_more')
        break
      }
      case 'exp_care_more': {
        if (lower.startsWith('y')) {
          nextAfter(200, 'Who is this expense for? (name).', 'exp_care_for')
        } else {
          nextAfter(200, 'Medical expenses for elderly/disabled members? (yes/no)', 'exp_med_check')
        }
        break
      }
      case 'exp_med_check': {
        if (lower.startsWith('y')) {
          nextAfter(200, 'Who is this for? (name).', 'exp_med_for')
        } else {
          nextAfter(200, 'Assets (optional). Would you like to add assets? (yes/no)', 'assets_check')
        }
        break
      }
      case 'exp_med_for': {
        setPendingMember({ person: didSkip ? null : userText })
        nextAfter(200, 'Amount and frequency? (e.g., $45 monthly). You can include a short description after a dash, like "$45 monthly - prescriptions".', 'exp_med_amount')
        break
      }
      case 'exp_med_amount': {
        const [first, ...rest] = userText.split('-')
        const desc = rest.join('-').trim() || null
        const { amount, frequency } = didSkip ? { amount: null, frequency: null } : parseMoneyFrequency(first)
        if (!didSkip && (!amount || !frequency)) {
          ask('Please include amount and frequency like "$45 monthly - prescriptions". Or type "skip".')
          break
        }
        setFormData((d) => ({
          ...d,
          expenses: {
            ...d.expenses,
            medical_elderly_disabled: [
              ...d.expenses.medical_elderly_disabled,
              { person: pendingMember?.person || 'Household Member', amount, frequency, description: desc },
            ],
          },
        }))
        nextAfter(200, 'Any other medical expenses to add? (yes/no)', 'exp_med_more')
        break
      }
      case 'exp_med_more': {
        if (lower.startsWith('y')) {
          nextAfter(200, 'Who is this for? (name).', 'exp_med_for')
        } else {
          nextAfter(200, 'Assets (optional). Would you like to add assets? (yes/no)', 'assets_check')
        }
        break
      }
      case 'assets_check': {
        if (lower.startsWith('y')) {
          nextAfter(200, 'Cash on hand (approx $) or type "skip".', 'asset_cash')
        } else {
          nextAfter(200, 'Work activities. Are you a current student? (yes/no/skip)', 'work_student')
        }
        break
      }
      case 'asset_cash': {
        const amount = didSkip ? null : parseFloat(userText.replace(/[^0-9.]/g, ''))
        setFormData((d) => ({ ...d, assets: { ...d.assets, cash_on_hand: Number.isNaN(amount) ? null : amount } }))
        nextAfter(200, 'Checking account balance (approx $) or type "skip".', 'asset_checking')
        break
      }
      case 'asset_checking': {
        const amount = didSkip ? null : parseFloat(userText.replace(/[^0-9.]/g, ''))
        setFormData((d) => ({ ...d, assets: { ...d.assets, checking: Number.isNaN(amount) ? null : amount } }))
        nextAfter(200, 'Savings account balance (approx $) or type "skip".', 'asset_savings')
        break
      }
      case 'asset_savings': {
        const amount = didSkip ? null : parseFloat(userText.replace(/[^0-9.]/g, ''))
        setFormData((d) => ({ ...d, assets: { ...d.assets, savings: Number.isNaN(amount) ? null : amount } }))
        nextAfter(200, 'Any vehicles to report? (yes/no)', 'asset_vehicle_check')
        break
      }
      case 'asset_vehicle_check': {
        if (lower.startsWith('y')) {
          nextAfter(200, 'Please enter a short vehicle description (e.g., 2012 Honda Civic).', 'asset_vehicle_add')
        } else {
          nextAfter(200, 'Work activities. Are you a current student? (yes/no/skip)', 'work_student')
        }
        break
      }
      case 'asset_vehicle_add': {
        setFormData((d) => ({ ...d, assets: { ...d.assets, vehicles: [...(d.assets.vehicles || []), userText] } }))
        nextAfter(200, 'Add another vehicle? (yes/no)', 'asset_vehicle_more')
        break
      }
      case 'asset_vehicle_more': {
        if (lower.startsWith('y')) {
          nextAfter(200, 'Enter another vehicle description.', 'asset_vehicle_add')
        } else {
          nextAfter(200, 'Work activities. Are you a current student? (yes/no/skip)', 'work_student')
        }
        break
      }
      case 'work_student': {
        const val = didSkip ? null : lower.startsWith('y')
        setFormData((d) => ({ ...d, work_activity: { ...d.work_activity, is_student: val } }))
        nextAfter(200, 'Are you in a work/training program? (yes/no/skip)', 'work_training')
        break
      }
      case 'work_training': {
        const val = didSkip ? null : lower.startsWith('y')
        setFormData((d) => ({ ...d, work_activity: { ...d.work_activity, is_in_training: val } }))
        nextAfter(200, 'Any recent job loss? (yes/no/skip)', 'work_job_loss')
        break
      }
      case 'work_job_loss': {
        const val = didSkip ? null : lower.startsWith('y')
        setFormData((d) => ({ ...d, work_activity: { ...d.work_activity, recent_job_loss: val } }))
        nextAfter(
          200,
          'Review & confirm. I will summarize each section so you can correct anything. Ready to review? (yes/no)',
          'review_ready'
        )
        break
      }
      case 'review_ready': {
        if (lower.startsWith('y')) {
          const summary = buildPlainSummary({ ...formData, household: { ...formData.household, members: householdMembers } })
          ask(summary)
          nextAfter(200, 'Would you like me to generate a final summary to paste into your application? (yes/no)', 'final_output_check')
        } else {
          ask('Okay. You can type the section name to revisit (e.g., "income"), or type "review" when ready.')
        }
        break
      }
      case 'final_output_check': {
        if (lower.startsWith('y')) {
          const json = buildFinalJson()
          const nowIso = new Date().toISOString()
          setFormData((d) => ({ ...d, meta: { ...d.meta, timestamp_iso: nowIso } }))
          ask('Here is your machine-readable summary followed by a short checklist. Please review carefully before submitting on your state portal.')
          setTimeout(() => {
            const jsonStr = JSON.stringify(json, null, 2)
            const aiMessage = { sender: 'ai', message: '```json\n' + jsonStr + '\n```', timestamp: new Date() }
            setMessages((prev) => [...prev, aiMessage])
          }, 100)
          const plain = buildPlainSummary(json)
          nextAfter(200, plain + '\n\nWhen ready, submit through your state portal. I can stay with you if you’d like.', 'done')
        } else {
          ask('Okay. You can continue answering or type "done" anytime.')
          setStep('done')
        }
        break
      }
      case 'done': {
        if (lower === 'review') {
          const summary = buildPlainSummary(buildFinalJson())
          ask(summary)
        } else {
          ask('If you need anything else, let me know. I’m here to help.')
        }
        break
      }
      default: {
        ask('I’m not a lawyer and can’t give legal advice. For official guidance, contact your local SNAP office. How can I help with your application details?')
      }
    }
  }

  const buildFinalJson = () => {
    const nowIso = new Date().toISOString()
    const json = {
      ...formData,
      meta: { ...formData.meta, timestamp_iso: nowIso },
      household: { ...formData.household, members: householdMembers },
    }
    // Ensure SSN is masked
    if (json.applicant?.ssn_last4 && /\d{4}/.test(json.applicant.ssn_last4)) {
      json.applicant.ssn_last4 = maskLast4(json.applicant.ssn_last4)
    }
    return json
  }

  const buildPlainSummary = (data) => {
    const bullets = []
    bullets.push(`- Meta: state=${data.meta.state || 'null'}, language=${data.meta.language || 'en'}`)
    bullets.push(`- Applicant: name=${data.applicant.full_name || 'null'}, dob=${data.applicant.dob || 'null'}`)
    bullets.push(`- Contact: phone=${data.applicant.phone || 'null'}, email=${data.applicant.email || 'null'}`)
    const addr = data.applicant.residential_address
    bullets.push(`- Address: ${[addr.street, addr.unit, addr.city, addr.state, addr.zip].filter(Boolean).join(', ') || 'null'}`)
    bullets.push(`- Mailing same: ${data.applicant.mailing_address_same ? 'true' : 'false'}`)
    bullets.push(`- Household size: ${data.household.size ?? 'null'}`)
    bullets.push(`- Members: ${(data.household.members || []).map((m) => m.full_name).filter(Boolean).join('; ') || 'none'}`)
    bullets.push(`- Income items: ${(data.income || []).length}`)
    bullets.push(`- Housing: ${(data.expenses.housing.rent_or_mortgage.amount ?? 'null')} ${data.expenses.housing.rent_or_mortgage.frequency ?? ''}`)
    bullets.push(`- Utilities: ${(data.expenses.housing.pays_utilities || []).join(', ') || 'none'}`)
    bullets.push(`- Care expenses: ${(data.expenses.child_or_adult_care || []).length}`)
    bullets.push(`- Medical expenses: ${(data.expenses.medical_elderly_disabled || []).length}`)
    bullets.push(`- Assets provided: ${data.assets.cash_on_hand != null || data.assets.checking != null || data.assets.savings != null || (data.assets.vehicles || []).length > 0 ? 'yes' : 'no'}`)
    bullets.push(`- Work activity: student=${data.work_activity.is_student ?? 'null'}, training=${data.work_activity.is_in_training ?? 'null'}, recent_job_loss=${data.work_activity.recent_job_loss ?? 'null'}`)
    bullets.push('- Guardrails: I can’t decide eligibility; this is a draft for your review.')
    return bullets.join('\n')
  }

  if (!hasStarted) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="mb-8">
            <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Food Assistance (SNAP)</h2>
            <div className="text-gray-700 mb-6 max-w-2xl mx-auto space-y-2 text-left">
              <p>I’ll ask one short question at a time. You can skip anything.</p>
              <ul className="list-disc ml-6 text-sm text-gray-600">
                <li>Forms vary by state; I’ll collect common info.</li>
                <li>I can’t decide eligibility. I’ll help collect answers for your application.</li>
                <li>We’ll create a summary you can paste into your application.</li>
              </ul>
            </div>
          </div>
          <button
            onClick={startApplication}
            className="px-8 py-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all duration-200 font-semibold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            Start Application
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-200px)] flex flex-col bg-white rounded-2xl shadow-xl overflow-hidden">
      <div className="bg-indigo-600 text-white p-6">
        <h2 className="text-2xl font-bold">CivicScribe — SNAP Application Assistant</h2>
        <p className="text-indigo-100 text-sm mt-1">I’ll guide you step by step. I’m not a lawyer and can’t give legal advice.</p>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[70%] rounded-2xl px-6 py-4 ${
                msg.sender === 'user'
                  ? 'bg-indigo-600 text-white rounded-br-none'
                  : 'bg-white text-gray-800 shadow-md rounded-bl-none border border-gray-200'
              }`}
            >
              <p className="whitespace-pre-wrap">{msg.message}</p>
              <span className={`text-xs mt-2 block ${
                msg.sender === 'user' ? 'text-indigo-200' : 'text-gray-500'
              }`}>
                {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white text-gray-800 rounded-2xl rounded-bl-none px-6 py-4 shadow-md border border-gray-200">
              <div className="flex space-x-2">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="border-t border-gray-200 p-6 bg-white">
        <form onSubmit={handleSubmit} className="flex gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your answer..."
            disabled={isLoading}
            className="flex-1 px-6 py-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed text-lg"
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="px-8 py-4 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-200 font-semibold shadow-lg hover:shadow-xl"
          >
            Send
          </button>
        </form>
        <p className="text-xs text-gray-500 mt-3 text-center">
          Your responses are saved automatically
        </p>
      </div>
    </div>
  )
}

export default ChatWindow
