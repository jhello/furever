(function () {
  'use strict';

  var KEYS = {
    token: 'furever.token',
    email: 'furever.email',
    lang: 'furever.lang',
    pets: 'furever.pets',
    server: 'furever.server'
  };

  var I18N = {
    zh: {
      appName: '毛孩子 FurEver',
      tagline: '记录毛孩子的每一天',
      login: '登录',
      register: '注册',
      email: '邮箱',
      password: '密码',
      loginAction: '登录',
      registerAction: '注册',
      haveAccount: '已有账户？',
      noAccount: '还没有账户？',
      goLogin: '去登录',
      goRegister: '去注册',
      emailPlaceholder: 'name@example.com',
      passwordHint: '密码至少 6 位',
      invalidEmail: '请输入有效的邮箱地址',
      passwordMin: '密码至少需要 6 位',
      fillAll: '请填写邮箱和密码',
      loginSuccess: '登录成功',
      registerSuccess: '注册成功',
      loading: '加载中...',
      networkError: '无法连接服务器，请检查服务端是否已启动',
      requestFailed: '请求失败',
      error: '操作失败',
      sending: '提交中...',
      welcome: '你好！我是毛孩子助手。',
      qSource: '你是准备管理自己的宠物，还是领养一只新宠物？',
      optOwn: '管理自己的宠物',
      optAdopt: '领养一只新宠物',
      qType: '你的宠物是哪一种？',
      optCat: '猫猫',
      optDog: '狗狗',
      qName: '它叫什么名字？',
      namePlaceholder: '输入宠物名字',
      qGender: '它的性别是？',
      optMale: '男孩',
      optFemale: '女孩',
      optUnknown: '未知',
      qBirthMode: '你知道它的出生日期吗？',
      birthExact: '准确日期',
      birthApprox: '大致日期',
      birthAge: '大致年龄',
      birthUnknown: '未知',
      birthExactLabel: '出生日期',
      birthApproxLabel: '大致月份',
      qBirthAge: '它几岁几个月？',
      ageYears: '岁',
      ageMonths: '个月',
      birthUnknownHint: '没关系，之后也可以补充。',
      qDates: '你们什么时候相识？又是什么时候在一起的呢？',
      metAtLabel: '相识时间',
      togetherSinceLabel: '在一起时间',
      qNeutered: '它已经绝育了吗？',
      optYes: '是',
      optNo: '否',
      qNeuterDetails: '绝育的时间和地点是？',
      neuterDateLabel: '绝育时间',
      neuterPlaceLabel: '绝育地点',
      confirm: '确认',
      next: '下一步',
      saved: '已保存到本机',
      savedDetail: '本地保存',
      addAnother: '再添加一只',
      petProfile: '宠物档案',
      source: '来源',
      type: '类型',
      gender: '性别',
      birth: '出生',
      met: '相识',
      together: '在一起',
      neuter: '绝育',
      notProvided: '未提供',
      sourceOwn: '自己管理',
      sourceAdopt: '新领养',
      chatPlaceholder: '请点击上方选项',
      settings: '设置',
      language: '语言',
      accountSecurity: '账户与安全',
      accountSecurityDesc: '管理登录邮箱与密码',
      about: '关于',
      logout: '退出登录',
      changeEmail: '更换邮箱',
      changePassword: '更改密码',
      forgotPassword: '忘记密码重置',
      currentPassword: '当前密码',
      newEmail: '新邮箱',
      newPassword: '新密码',
      submit: '提交',
      emailChanged: '邮箱已更新',
      passwordChanged: '密码已更新',
      passwordReset: '密码已重置',
      currentEmail: '当前邮箱',
      forgotHint: '重置令牌会直接显示，请复制到下方完成重置。',
      resetToken: '重置令牌',
      aboutDescription: '一个记录宠物信息的简单应用。',
      version: '版本',
      localData: '宠物资料仅保存在本机。',
      serverInfo: '服务端只保存账户登录信息。'
    },
    en: {
      appName: 'FurEver',
      tagline: 'Keep every day with your furry friend',
      login: 'Log in',
      register: 'Sign up',
      email: 'Email',
      password: 'Password',
      loginAction: 'Log in',
      registerAction: 'Sign up',
      haveAccount: 'Already have an account?',
      noAccount: 'No account yet?',
      goLogin: 'Log in',
      goRegister: 'Sign up',
      emailPlaceholder: 'name@example.com',
      passwordHint: 'At least 6 characters',
      invalidEmail: 'Please enter a valid email',
      passwordMin: 'Password must be at least 6 characters',
      fillAll: 'Please enter email and password',
      loginSuccess: 'Logged in',
      registerSuccess: 'Account created',
      loading: 'Loading...',
      networkError: 'Cannot reach the server. Is it running?',
      requestFailed: 'Request failed',
      error: 'Something went wrong',
      sending: 'Submitting...',
      welcome: 'Hi! I am your FurEver assistant.',
      qSource: 'Are you managing your own pet, or adopting a new one?',
      optOwn: 'Manage my pet',
      optAdopt: 'Adopt a new pet',
      qType: 'What kind of pet is it?',
      optCat: 'Cat',
      optDog: 'Dog',
      qName: 'What is its name?',
      namePlaceholder: 'Pet name',
      qGender: 'What is its gender?',
      optMale: 'Male',
      optFemale: 'Female',
      optUnknown: 'Unknown',
      qBirthMode: 'Do you know its birthday?',
      birthExact: 'Exact date',
      birthApprox: 'Approximate date',
      birthAge: 'Approximate age',
      birthUnknown: 'Unknown',
      birthExactLabel: 'Birth date',
      birthApproxLabel: 'Birth month',
      qBirthAge: 'How old is it (years / months)?',
      ageYears: 'years',
      ageMonths: 'months',
      birthUnknownHint: 'No problem, you can add it later.',
      qDates: 'When did you meet, and when did you start living together?',
      metAtLabel: 'Met on',
      togetherSinceLabel: 'Together since',
      qNeutered: 'Is it neutered?',
      optYes: 'Yes',
      optNo: 'No',
      qNeuterDetails: 'When and where was it neutered?',
      neuterDateLabel: 'Neuter date',
      neuterPlaceLabel: 'Neuter place',
      confirm: 'Confirm',
      next: 'Next',
      saved: 'Saved on this device',
      savedDetail: 'Saved locally',
      addAnother: 'Add another pet',
      petProfile: 'Pet profile',
      source: 'Source',
      type: 'Type',
      gender: 'Gender',
      birth: 'Birth',
      met: 'Met',
      together: 'Together',
      neuter: 'Neutered',
      notProvided: 'Not provided',
      sourceOwn: 'My own pet',
      sourceAdopt: 'New adoption',
      chatPlaceholder: 'Choose an option above',
      settings: 'Settings',
      language: 'Language',
      accountSecurity: 'Account & Security',
      accountSecurityDesc: 'Manage your login email and password',
      about: 'About',
      logout: 'Log out',
      changeEmail: 'Change email',
      changePassword: 'Change password',
      forgotPassword: 'Reset forgotten password',
      currentPassword: 'Current password',
      newEmail: 'New email',
      newPassword: 'New password',
      submit: 'Submit',
      emailChanged: 'Email updated',
      passwordChanged: 'Password updated',
      passwordReset: 'Password reset',
      currentEmail: 'Current email',
      forgotHint: 'The reset token is shown here. Copy it below to finish.',
      resetToken: 'Reset token',
      aboutDescription: 'A simple app for recording your pet information.',
      version: 'Version',
      localData: 'Pet profiles are stored only on this device.',
      serverInfo: 'The server only stores account login information.'
    }
  };

  var app = document.getElementById('app');
  var toastEl = document.getElementById('toast');
  var config = window.FUREVER_CONFIG || {};
  var sequence = 0;
  var toastTimer = null;
  var lastSyncedHash = null;

  function newDraft() {
    return {
      source: '',
      type: '',
      name: '',
      gender: '',
      birthMode: 'exact',
      birthDate: '',
      birthMonth: '',
      ageYears: '',
      ageMonths: '',
      metAt: '',
      togetherSince: '',
      neutered: undefined,
      neuterDate: '',
      neuterPlace: ''
    };
  }

  function initialLanguage() {
    var saved = localStorage.getItem(KEYS.lang);
    if (saved === 'zh' || saved === 'en') return saved;
    return String(navigator.language || '').toLowerCase().indexOf('zh') === 0 ? 'zh' : 'en';
  }

  var state = {
    lang: initialLanguage(),
    route: '',
    historyDepth: 0,
    busy: false,
    auth: { mode: 'login', email: '', password: '', error: '' },
    emailForm: { newEmail: '', password: '', message: '', ok: false },
    passwordForm: { current: '', next: '', message: '', ok: false },
    forgot: { email: '', token: '', password: '', stage: 'request', message: '', ok: false, done: false },
    chat: { messages: [], draft: newDraft(), name: '' },
    scroll: {},
    scrollChatToBottom: false
  };

  function t(key) {
    return (I18N[state.lang] && I18N[state.lang][key]) || I18N.zh[key] || key;
  }

  function esc(value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, function (char) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char];
    });
  }

  function uid() {
    sequence += 1;
    return Date.now() + '-' + sequence;
  }

  function pawSvg(size) {
    return '<svg width="' + size + '" height="' + size + '" viewBox="0 0 24 24" fill="none" ' +
      'stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
      '<circle cx="6.3" cy="10.2" r="1.5"></circle>' +
      '<circle cx="9.6" cy="7.2" r="1.5"></circle>' +
      '<circle cx="14.4" cy="7.2" r="1.5"></circle>' +
      '<circle cx="17.7" cy="10.2" r="1.5"></circle>' +
      '<path d="M12 12.9c-2.2 0-3.9 1.6-4.7 3.2-.5 1 .2 2.2 1.3 2.2 1 0 2-.6 3.4-.6s2.4.6 3.4.6c1.1 0 1.8-1.2 1.3-2.2-.8-1.6-2.5-3.2-4.7-3.2Z"></path>' +
      '</svg>';
  }

  function getToken() {
    return localStorage.getItem(KEYS.token);
  }

  function getEmail() {
    return localStorage.getItem(KEYS.email) || '';
  }

  function clearAuth() {
    localStorage.removeItem(KEYS.token);
    localStorage.removeItem(KEYS.email);
    state.historyDepth = 0;
  }

  function loadPets() {
    try {
      var raw = localStorage.getItem(KEYS.pets);
      var parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      return [];
    }
  }

  function savePet(pet) {
    var pets = loadPets();
    pets.push(pet);
    localStorage.setItem(KEYS.pets, JSON.stringify(pets));
  }

  function apiBase() {
    var base = localStorage.getItem(KEYS.server) ||
      config.defaultServer ||
      (location.protocol.indexOf('http') === 0 ? location.origin : 'http://127.0.0.1:3000');
    return String(base).replace(/\/$/, '');
  }

  function api(path, options) {
    var requestOptions = Object.assign({}, options || {});
    var headers = Object.assign({}, requestOptions.headers || {});
    if (requestOptions.body && !headers['Content-Type']) headers['Content-Type'] = 'application/json';
    var token = getToken();
    if (token) headers.Authorization = 'Bearer ' + token;
    requestOptions.headers = headers;

    return fetch(apiBase() + path, requestOptions).then(function (response) {
      return response.json().catch(function () { return {}; }).then(function (data) {
        if (!response.ok) {
          if (response.status === 401) {
            clearAuth();
            if (state.route !== '/login') go('/login', true);
          }
          var message = data && (data.message || data.error);
          throw new Error(message || t('requestFailed'));
        }
        return data;
      });
    }).catch(function (error) {
      if (error instanceof Error && error.message) throw error;
      throw new Error(t('networkError'));
    });
  }

  function showToast(message) {
    if (!toastEl) return;
    toastEl.textContent = message || '';
    toastEl.classList.add('is-visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove('is-visible');
    }, 2400);
  }

  function applyLang() {
    document.documentElement.lang = state.lang === 'zh' ? 'zh-CN' : 'en';
    document.title = t('appName');
  }

  function toggleLang() {
    state.lang = state.lang === 'zh' ? 'en' : 'zh';
    try {
      localStorage.setItem(KEYS.lang, state.lang);
    } catch (error) {
      /* storage may be unavailable */
    }
    applyLang();
    render();
  }

  function currentPath() {
    var raw = window.location.hash.replace(/^#/, '');
    if (!raw || raw.charAt(0) !== '/') return '';
    return normalizePath(raw.split('?')[0]);
  }

  function normalizePath(path) {
    path = String(path || '');
    if (path.charAt(0) !== '/') path = '/' + path;
    if (path.length > 1 && path.charAt(path.length - 1) === '/') path = path.slice(0, -1);
    return path;
  }

  var ROUTES = [
    '/', '/settings', '/settings/account', '/settings/account/email',
    '/settings/account/password', '/settings/account/forgot', '/settings/about'
  ];

  var PARENTS = {
    '/settings/account/email': '/settings/account',
    '/settings/account/password': '/settings/account',
    '/settings/account/forgot': '/settings/account',
    '/settings/account': '/settings',
    '/settings/about': '/settings',
    '/settings': '/'
  };

  function resolveRoute(path) {
    var valid = path === '/login' || ROUTES.indexOf(path) >= 0 ? path : '';
    if (!valid) return getToken() ? '/' : '/login';
    if (!getToken() && valid !== '/login') return '/login';
    if (getToken() && valid === '/login') return '/';
    return valid;
  }

  function syncRoute(isPop) {
    var hash = window.location.hash;
    if (!isPop && hash === lastSyncedHash) return;
    if (isPop && state.historyDepth > 0) state.historyDepth -= 1;

    var path = currentPath();
    var target = resolveRoute(path);
    if (target !== path) history.replaceState({ fv: true }, '', '#' + target);

    state.route = target;
    lastSyncedHash = window.location.hash;
    render();
  }

  function go(path, replace) {
    path = normalizePath(path);
    var current = currentPath();
    if (replace || current === path) {
      history.replaceState({ fv: true }, '', '#' + path);
    } else {
      history.pushState({ fv: true }, '', '#' + path);
      state.historyDepth += 1;
    }
    syncRoute(false);
  }

  window.__fureverSystemBack = function () {
    var target = resolveRoute(currentPath());
    if (state.historyDepth > 0) {
      history.back();
      return true;
    }
    if (PARENTS[target]) {
      go(PARENTS[target], true);
      return true;
    }
    return false;
  };

  window.__fureverTopInset = function (dp) {
    var value = Number(dp);
    if (!isFinite(value) || value < 0) value = 0;
    document.documentElement.style.setProperty('--status-h', value + 'px');
  };

  function langButton() {
    return '<button type="button" class="fv-lang-btn" data-action="toggle-lang" aria-label="' +
      esc(t('language')) + '">中 / EN</button>';
  }

  function assistant(key, input, options, pet) {
    var message = { id: uid(), role: 'assistant', key: key, input: input || null, options: options || null };
    if (pet) message.pet = pet;
    return message;
  }

  function lastMessage() {
    return state.chat.messages[state.chat.messages.length - 1] || null;
  }

  function optionsOf(pairs) {
    return pairs.map(function (pair) { return { labelKey: pair[0], value: pair[1] }; });
  }

  function sourceOptions() {
    return optionsOf([['optOwn', 'own'], ['optAdopt', 'adopt']]);
  }

  function initChat() {
    if (state.chat.messages.length) return;
    var pets = loadPets();
    if (pets.length) {
      state.chat.messages = [
        assistant('welcome'),
        assistant('saved', null, null, pets[pets.length - 1])
      ];
    } else {
      state.chat.messages = [assistant('qSource', 'source', sourceOptions())];
    }
  }

  function ageText(years, months) {
    var parts = [];
    if (Number(years)) parts.push(years + t('ageYears'));
    if (Number(months)) parts.push(months + t('ageMonths'));
    return parts.join(' ') || t('birthUnknown');
  }

  function messageText(message) {
    if (message.text != null) return message.text;
    if (message.kind === 'age') return ageText(message.years, message.months);
    if (message.kind === 'dates') {
      return [message.metAt, message.togetherSince].filter(Boolean).join(' / ') || t('notProvided');
    }
    return message.key ? t(message.key) : '';
  }

  function birthText(pet) {
    if (pet.birthMode === 'exact') return pet.birthDate || t('notProvided');
    if (pet.birthMode === 'approx') return pet.birthMonth || t('notProvided');
    if (pet.birthMode === 'age') return ageText(pet.ageYears, pet.ageMonths);
    return t('birthUnknown');
  }

  function lockLastMessage() {
    var last = lastMessage();
    if (last && last.role === 'assistant') {
      last.input = null;
      last.options = null;
    }
  }

  function appendChat(userSpec, nextMessage) {
    lockLastMessage();
    state.chat.messages.push(Object.assign({ id: uid(), role: 'user' }, userSpec));
    if (nextMessage) state.chat.messages.push(nextMessage);
    state.scrollChatToBottom = true;
    render();
  }

  function buildPet(patch) {
    var d = Object.assign({}, state.chat.draft, patch || {});
    return {
      id: (typeof crypto !== 'undefined' && crypto.randomUUID) ? crypto.randomUUID() : uid(),
      source: d.source || 'own',
      type: d.type || 'cat',
      name: d.name || '',
      gender: d.gender || 'unknown',
      birthMode: d.birthMode || 'unknown',
      birthDate: d.birthDate || '',
      birthMonth: d.birthMonth || '',
      ageYears: d.ageYears ? Number(d.ageYears) : 0,
      ageMonths: d.ageMonths ? Number(d.ageMonths) : 0,
      metAt: d.metAt || '',
      togetherSince: d.togetherSince || '',
      neutered: d.neutered === true,
      neuterDate: d.neuterDate || '',
      neuterPlace: d.neuterPlace || '',
      createdAt: new Date().toISOString()
    };
  }

  function finishPet(userSpec, patch) {
    var pet = buildPet(patch);
    savePet(pet);
    lockLastMessage();
    state.chat.messages.push(Object.assign({ id: uid(), role: 'user' }, userSpec));
    state.chat.messages.push(assistant('saved', null, null, pet));
    state.chat.draft = newDraft();
    state.chat.name = '';
    state.scrollChatToBottom = true;
    showToast(t('saved'));
    render();
  }

  function handlePick(value) {
    var last = lastMessage();
    if (!last || !last.input) return;

    switch (last.input) {
      case 'source': {
        var source = value === 'adopt' ? 'adopt' : 'own';
        state.chat.draft.source = source;
        appendChat({ key: source === 'own' ? 'optOwn' : 'optAdopt' }, assistant('qType', 'type', optionsOf([
          ['optCat', 'cat'], ['optDog', 'dog']
        ])));
        break;
      }
      case 'type': {
        var type = value === 'dog' ? 'dog' : 'cat';
        state.chat.draft.type = type;
        appendChat({ key: type === 'cat' ? 'optCat' : 'optDog' }, assistant('qName', 'name'));
        break;
      }
      case 'gender': {
        var gender = ['male', 'female', 'unknown'].indexOf(value) >= 0 ? value : 'unknown';
        state.chat.draft.gender = gender;
        var label = gender === 'male' ? 'optMale' : gender === 'female' ? 'optFemale' : 'optUnknown';
        appendChat({ key: label }, assistant('qBirthMode', 'birthMode', optionsOf([
          ['birthExact', 'exact'], ['birthApprox', 'approx'], ['birthAge', 'age'], ['birthUnknown', 'unknown']
        ])));
        break;
      }
      case 'birthMode': {
        var mode = ['exact', 'approx', 'age', 'unknown'].indexOf(value) >= 0 ? value : 'exact';
        state.chat.draft.birthMode = mode;
        var label = mode === 'exact' ? 'birthExact' :
          mode === 'approx' ? 'birthApprox' :
            mode === 'age' ? 'birthAge' : 'birthUnknown';
        var question = mode === 'exact' ? 'birthExactLabel' :
          mode === 'approx' ? 'birthApproxLabel' :
            mode === 'age' ? 'qBirthAge' : 'birthUnknownHint';
        appendChat({ key: label }, assistant(question, 'birthInput'));
        break;
      }
      case 'neutered': {
        if (value === 'no') {
          finishPet({ key: 'optNo' }, { neutered: false });
        } else {
          state.chat.draft.neutered = true;
          appendChat({ key: 'optYes' }, assistant('qNeuterDetails', 'neuterDetails'));
        }
        break;
      }
      default:
        break;
    }
  }

  function confirmBirth() {
    var d = state.chat.draft;
    var userSpec;
    if (d.birthMode === 'exact') {
      if (!d.birthDate) return;
      userSpec = { text: d.birthDate };
    } else if (d.birthMode === 'approx') {
      if (!d.birthMonth) return;
      userSpec = { text: d.birthMonth };
    } else if (d.birthMode === 'age') {
      if (!d.ageYears && !d.ageMonths) return;
      userSpec = { kind: 'age', years: d.ageYears, months: d.ageMonths };
    } else {
      userSpec = { key: 'birthUnknown' };
    }
    appendChat(userSpec, assistant('qDates', 'dates'));
  }

  function confirmDates() {
    var d = state.chat.draft;
    if (!d.metAt || !d.togetherSince) return;
    appendChat(
      { kind: 'dates', metAt: d.metAt, togetherSince: d.togetherSince },
      assistant('qNeutered', 'neutered', optionsOf([['optYes', 'yes'], ['optNo', 'no']]))
    );
  }

  function confirmNeuter() {
    var d = state.chat.draft;
    var text = [d.neuterDate, d.neuterPlace].filter(Boolean).join(' · ');
    finishPet({ text: text || t('notProvided') }, { neutered: true });
  }

  function submitName() {
    var name = String(state.chat.name || '').trim();
    if (!name) return;
    state.chat.draft.name = name;
    state.chat.name = '';
    appendChat({ text: name }, assistant('qGender', 'gender', optionsOf([
      ['optMale', 'male'], ['optFemale', 'female'], ['optUnknown', 'unknown']
    ])));
  }

  function addAnother() {
    state.chat.draft = newDraft();
    state.chat.name = '';
    state.chat.messages.push(assistant('qSource', 'source', sourceOptions()));
    state.scrollChatToBottom = true;
    render();
  }

  function renderOptions(options) {
    if (!options || !options.length) return '';
    return '<div class="fv-options">' + options.map(function (option) {
      return '<button type="button" class="fv-option" data-action="pick" data-value="' +
        esc(option.value) + '">' + esc(t(option.labelKey)) + '</button>';
    }).join('') + '</div>';
  }

  function renderInlineInput(message) {
    var d = state.chat.draft;
    switch (message.input) {
      case 'birthInput':
        var html = '<div class="fv-inline">';
        if (d.birthMode === 'exact') {
          html += '<label class="fv-field"><span>' + esc(t('birthExactLabel')) + '</span>' +
            '<input type="date" data-field="chat.draft.birthDate" value="' + esc(d.birthDate) + '"></label>';
        } else if (d.birthMode === 'approx') {
          html += '<label class="fv-field"><span>' + esc(t('birthApproxLabel')) + '</span>' +
            '<input type="month" data-field="chat.draft.birthMonth" value="' + esc(d.birthMonth) + '"></label>';
        } else if (d.birthMode === 'age') {
          html += '<div class="fv-inline-row">' +
            '<label class="fv-field"><span>' + esc(t('ageYears')) + '</span>' +
            '<input type="number" min="0" max="30" data-field="chat.draft.ageYears" value="' + esc(d.ageYears) + '"></label>' +
            '<label class="fv-field"><span>' + esc(t('ageMonths')) + '</span>' +
            '<input type="number" min="0" max="11" data-field="chat.draft.ageMonths" value="' + esc(d.ageMonths) + '"></label>' +
            '</div>';
        }
        html += '<button type="button" class="fv-primary" data-action="confirm-birth">' +
          esc(d.birthMode === 'unknown' ? t('next') : t('confirm')) + '</button></div>';
        return html;

      case 'dates':
        return '<div class="fv-inline">' +
          '<label class="fv-field"><span>' + esc(t('metAtLabel')) + '</span>' +
          '<input type="date" data-field="chat.draft.metAt" value="' + esc(d.metAt) + '"></label>' +
          '<label class="fv-field"><span>' + esc(t('togetherSinceLabel')) + '</span>' +
          '<input type="date" data-field="chat.draft.togetherSince" value="' + esc(d.togetherSince) + '"></label>' +
          '<button type="button" class="fv-primary" data-action="confirm-dates">' + esc(t('confirm')) + '</button>' +
          '</div>';

      case 'neuterDetails':
        return '<div class="fv-inline">' +
          '<label class="fv-field"><span>' + esc(t('neuterDateLabel')) + '</span>' +
          '<input type="date" data-field="chat.draft.neuterDate" value="' + esc(d.neuterDate) + '"></label>' +
          '<label class="fv-field"><span>' + esc(t('neuterPlaceLabel')) + '</span>' +
          '<input type="text" data-field="chat.draft.neuterPlace" value="' + esc(d.neuterPlace) + '"></label>' +
          '<button type="button" class="fv-primary" data-action="confirm-neuter">' + esc(t('confirm')) + '</button>' +
          '</div>';

      default:
        return '';
    }
  }

  function renderProfile(pet) {
    var rows = [
      [t('source'), pet.source === 'adopt' ? t('sourceAdopt') : t('sourceOwn')],
      [t('type'), pet.type === 'dog' ? t('optDog') : t('optCat')],
      [t('gender'), pet.gender === 'male' ? t('optMale') : pet.gender === 'female' ? t('optFemale') : t('optUnknown')],
      [t('birth'), birthText(pet)],
      [t('met'), pet.metAt || t('notProvided')],
      [t('together'), pet.togetherSince || t('notProvided')],
      [t('neuter'), pet.neutered ? [t('optYes'), pet.neuterDate, pet.neuterPlace].filter(Boolean).join(' · ') : t('optNo')]
    ];

    return '<div class="fv-profile">' +
      '<div class="fv-profile-head">' +
      '<span class="fv-profile-emoji">' + (pet.type === 'dog' ? '🐶' : '🐱') + '</span>' +
      '<div><strong>' + esc(pet.name) + '</strong><small>' + esc(t('petProfile')) + ' · ' + esc(t('savedDetail')) + '</small></div>' +
      '</div><dl>' + rows.map(function (row) {
        return '<div><dt>' + esc(row[0]) + '</dt><dd>' + esc(row[1]) + '</dd></div>';
      }).join('') + '</dl></div>';
  }

  function renderMessage(message, isLast) {
    var html = '<div class="fv-row ' + (message.role === 'assistant' ? 'assistant' : 'user') + '">';
    if (message.role === 'assistant') html += '<span class="fv-avatar">' + pawSvg(17) + '</span>';
    html += '<div class="fv-col"><div class="fv-bubble"><p>' + esc(messageText(message)) + '</p>';
    if (message.pet) {
      html += renderProfile(message.pet) +
        '<button type="button" class="fv-link" data-action="add-another">' + esc(t('addAnother')) + '</button>';
    }
    html += '</div>';
    if (isLast && message.input) {
      html += renderOptions(message.options) + renderInlineInput(message);
    }
    return html + '</div></div>';
  }

  function renderChat() {
    var messages = state.chat.messages;
    var html = '<div class="fv-screen fv-chat">' +
      '<div class="fv-top"><button type="button" class="fv-icon-btn" data-action="nav" data-path="/settings" ' +
      'aria-label="' + esc(t('settings')) + '">' + pawSvg(22) + '</button></div>' +
      '<div class="fv-scroll" data-scroll="chat"><div class="fv-chat-list">';

    html += messages.map(function (message, index) {
      return renderMessage(message, index === messages.length - 1);
    }).join('');
    html += '</div></div><footer class="fv-composer">';

    var last = lastMessage();
    if (last && last.input === 'name') {
      html += '<form class="fv-composer-inner" data-form="name">' +
        '<input type="text" data-field="chat.name" value="' + esc(state.chat.name) + '" ' +
        'placeholder="' + esc(t('namePlaceholder')) + '" autocomplete="off">' +
        '<button type="submit" class="fv-send" aria-label="' + esc(t('confirm')) + '">↑</button></form>';
    } else {
      html += '<div class="fv-composer-hint">' + esc(t('chatPlaceholder')) + '</div>';
    }
    return html + '</footer></div>';
  }

  function formMessage(text, ok) {
    if (!text) return '';
    return '<p class="' + (ok ? 'fv-msg-ok' : 'fv-msg-error') + '">' + esc(text) + '</p>';
  }

  function field(label, attrs, value) {
    return '<label class="fv-field"><span>' + esc(label) + '</span><input ' + attrs +
      ' value="' + esc(value) + '"></label>';
  }

  function renderAuth() {
    var a = state.auth;
    var isLogin = a.mode === 'login';
    return '<div class="fv-screen fv-auth">' +
      '<div class="fv-top">' + langButton() + '</div>' +
      '<main class="fv-auth-card">' +
      '<div class="fv-brand"><span class="fv-brand-icon">' + pawSvg(34) + '</span>' +
      '<p>' + esc(t('tagline')) + '</p></div>' +
      '<div class="fv-tabs" role="tablist">' +
      '<button type="button" role="tab" aria-selected="' + isLogin + '" class="' + (isLogin ? 'active' : '') +
      '" data-action="auth-tab" data-mode="login">' + esc(t('login')) + '</button>' +
      '<button type="button" role="tab" aria-selected="' + (!isLogin) + '" class="' + (!isLogin ? 'active' : '') +
      '" data-action="auth-tab" data-mode="register">' + esc(t('register')) + '</button>' +
      '</div>' +
      '<form class="fv-form" data-form="auth">' +
      field(t('email'), 'type="email" name="email" autocomplete="email" inputmode="email" required data-field="auth.email" placeholder="' + esc(t('emailPlaceholder')) + '"', a.email) +
      field(t('password'), 'type="password" name="password" autocomplete="' + (isLogin ? 'current-password' : 'new-password') +
        '" minlength="6" required data-field="auth.password" placeholder="' + esc(t('passwordHint')) + '"', a.password) +
      formMessage(a.error, false) +
      '<button type="submit" class="fv-primary"' + (state.busy ? ' disabled' : '') + '>' +
      esc(state.busy ? t('sending') : isLogin ? t('loginAction') : t('registerAction')) + '</button>' +
      '</form>' +
      '<p class="fv-switch">' + esc(isLogin ? t('noAccount') : t('haveAccount')) + ' ' +
      '<button type="button" class="fv-link" data-action="auth-switch">' +
      esc(isLogin ? t('goRegister') : t('goLogin')) + '</button></p>' +
      '</main></div>';
  }

  function listItem(icon, label, description, path) {
    return '<button type="button" class="fv-list-item" data-action="nav" data-path="' + esc(path) + '">' +
      (icon ? '<span class="fv-list-icon">' + icon + '</span>' : '') +
      '<span class="fv-list-text"><strong>' + esc(label) + '</strong>' +
      (description ? '<small>' + esc(description) + '</small>' : '') +
      '</span><span class="fv-chevron">›</span></button>';
  }

  function renderSettings() {
    return '<div class="fv-screen">' +
      '<div class="fv-top">' + langButton() + '</div>' +
      '<main class="fv-content" data-scroll="/settings">' +
      '<section class="fv-list"><p class="fv-account">' + esc(getEmail()) + '</p>' +
      listItem('🔒', t('accountSecurity'), t('accountSecurityDesc'), '/settings/account') +
      listItem('ⓘ', t('about'), '', '/settings/about') +
      '</section>' +
      '<button type="button" class="fv-secondary danger" data-action="logout">' + esc(t('logout')) + '</button>' +
      '</main></div>';
  }

  function renderAccount() {
    return '<div class="fv-screen">' +
      '<div class="fv-top">' + langButton() + '</div>' +
      '<main class="fv-content" data-scroll="/settings/account">' +
      '<section class="fv-list">' +
      listItem('', t('changeEmail'), '', '/settings/account/email') +
      listItem('', t('changePassword'), '', '/settings/account/password') +
      listItem('', t('forgotPassword'), '', '/settings/account/forgot') +
      '</section></main></div>';
  }

  function renderEmailForm() {
    var f = state.emailForm;
    return '<div class="fv-screen">' +
      '<div class="fv-top">' + langButton() + '</div>' +
      '<main class="fv-content" data-scroll="/settings/account/email">' +
      '<form class="fv-form fv-card" data-form="email">' +
      field(t('newEmail'), 'type="email" autocomplete="email" required data-field="emailForm.newEmail"', f.newEmail) +
      field(t('currentPassword'), 'type="password" autocomplete="current-password" required data-field="emailForm.password"', f.password) +
      formMessage(f.message, f.ok) +
      '<button type="submit" class="fv-primary"' + (state.busy ? ' disabled' : '') + '>' +
      esc(state.busy ? t('sending') : t('submit')) + '</button>' +
      '</form></main></div>';
  }

  function renderPasswordForm() {
    var f = state.passwordForm;
    return '<div class="fv-screen">' +
      '<div class="fv-top">' + langButton() + '</div>' +
      '<main class="fv-content" data-scroll="/settings/account/password">' +
      '<form class="fv-form fv-card" data-form="password">' +
      field(t('currentPassword'), 'type="password" autocomplete="current-password" required data-field="passwordForm.current"', f.current) +
      field(t('newPassword'), 'type="password" autocomplete="new-password" minlength="6" required data-field="passwordForm.next"', f.next) +
      formMessage(f.message, f.ok) +
      '<button type="submit" class="fv-primary"' + (state.busy ? ' disabled' : '') + '>' +
      esc(state.busy ? t('sending') : t('submit')) + '</button>' +
      '</form></main></div>';
  }

  function renderForgotForm() {
    var f = state.forgot;
    var body = '<p class="fv-hint">' + esc(t('forgotHint')) + '</p>';
    if (f.stage === 'request') {
      body += '<form class="fv-form fv-card" data-form="forgot-request">' +
        field(t('email'), 'type="email" autocomplete="email" required data-field="forgot.email"', f.email) +
        formMessage(f.message, f.ok) +
        '<button type="submit" class="fv-primary"' + (state.busy ? ' disabled' : '') + '>' +
        esc(state.busy ? t('sending') : t('submit')) + '</button></form>';
    } else {
      body += '<form class="fv-form fv-card" data-form="forgot-reset">' +
        '<label class="fv-field"><span>' + esc(t('resetToken')) + '</span>' +
        '<textarea rows="3" required data-field="forgot.token">' + esc(f.token) + '</textarea></label>' +
        field(t('newPassword'), 'type="password" autocomplete="new-password" minlength="6" required data-field="forgot.password"', f.password) +
        formMessage(f.message, f.ok) +
        '<button type="submit" class="fv-primary"' + (state.busy ? ' disabled' : '') + '>' +
        esc(state.busy ? t('sending') : t('submit')) + '</button>';
      if (f.done) {
        body += '<button type="button" class="fv-secondary" data-action="go-login">' + esc(t('goLogin')) + '</button>';
      }
      body += '</form>';
    }
    return '<div class="fv-screen">' +
      '<div class="fv-top">' + langButton() + '</div>' +
      '<main class="fv-content" data-scroll="/settings/account/forgot">' + body + '</main></div>';
  }

  function renderAbout() {
    var rows = [
      [t('version'), config.version || '0.2.0'],
      [t('localData'), 'localStorage'],
      [t('serverInfo'), 'API']
    ];
    return '<div class="fv-screen">' +
      '<div class="fv-top">' + langButton() + '</div>' +
      '<main class="fv-content fv-about" data-scroll="/settings/about">' +
      '<div class="fv-about-brand">' + pawSvg(44) + '<p>' + esc(t('aboutDescription')) + '</p></div>' +
      '<dl class="fv-about-list">' + rows.map(function (row) {
        return '<div><dt>' + esc(row[0]) + '</dt><dd>' + esc(row[1]) + '</dd></div>';
      }).join('') + '</dl></main></div>';
  }

  function renderRoute() {
    switch (state.route) {
      case '/login': return renderAuth();
      case '/': return renderChat();
      case '/settings': return renderSettings();
      case '/settings/account': return renderAccount();
      case '/settings/account/email': return renderEmailForm();
      case '/settings/account/password': return renderPasswordForm();
      case '/settings/account/forgot': return renderForgotForm();
      case '/settings/about': return renderAbout();
      default: return '<div class="fv-screen"><div class="fv-center fv-content">' + esc(t('loading')) + '</div></div>';
    }
  }

  function render() {
    if (!app) return;
    var scrollKey = state.route === '/' ? 'chat' : state.route;
    var oldScroller = app.querySelector('[data-scroll]');
    if (oldScroller) state.scroll[scrollKey] = oldScroller.scrollTop;

    app.innerHTML = renderRoute();

    var scroller = app.querySelector('[data-scroll]');
    if (scroller) {
      if (scrollKey === 'chat' && state.scrollChatToBottom) {
        scroller.scrollTop = scroller.scrollHeight;
        state.scrollChatToBottom = false;
      } else {
        scroller.scrollTop = state.scroll[scrollKey] || 0;
      }
    }
  }

  function setPath(root, path, value) {
    var parts = path.split('.');
    var current = root;
    for (var i = 0; i < parts.length - 1; i += 1) {
      if (!current[parts[i]] || typeof current[parts[i]] !== 'object') current[parts[i]] = {};
      current = current[parts[i]];
    }
    current[parts[parts.length - 1]] = value;
  }

  function readForm(form) {
    var fields = form.querySelectorAll('[data-field]');
    for (var i = 0; i < fields.length; i += 1) {
      setPath(state, fields[i].getAttribute('data-field'), fields[i].value);
    }
  }

  function onFieldInput(event) {
    var el = event.target;
    if (!el || !el.getAttribute) return;
    var path = el.getAttribute('data-field');
    if (path) setPath(state, path, el.value);
  }

  function submitAuth() {
    if (state.busy) return;
    var email = String(state.auth.email || '').trim();
    var password = state.auth.password || '';
    if (!email || !password) {
      state.auth.error = t('fillAll');
      render();
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      state.auth.error = t('invalidEmail');
      render();
      return;
    }
    if (password.length < 6) {
      state.auth.error = t('passwordMin');
      render();
      return;
    }

    var mode = state.auth.mode;
    state.busy = true;
    state.auth.error = '';
    render();

    api('/api/auth/' + mode, {
      method: 'POST',
      body: JSON.stringify({ email: email, password: password })
    }).then(function (result) {
      localStorage.setItem(KEYS.token, result.token || '');
      localStorage.setItem(KEYS.email, result.email || email);
      state.auth.password = '';
      state.historyDepth = 0;
      showToast(t(mode === 'login' ? 'loginSuccess' : 'registerSuccess'));
      go('/', true);
    }).catch(function (error) {
      state.auth.error = error && error.message ? error.message : t('error');
    }).then(function () {
      state.busy = false;
      render();
    });
  }

  function submitEmail() {
    if (state.busy) return;
    var email = String(state.emailForm.newEmail || '').trim();
    var password = state.emailForm.password || '';
    if (!email || !password) {
      state.emailForm.message = t('fillAll');
      state.emailForm.ok = false;
      render();
      return;
    }
    state.busy = true;
    state.emailForm.message = '';
    render();

    api('/api/account/email', {
      method: 'PUT',
      body: JSON.stringify({ email: email, password: password })
    }).then(function (result) {
      localStorage.setItem(KEYS.email, (result && result.email) || email);
      state.emailForm.newEmail = '';
      state.emailForm.password = '';
      state.emailForm.message = t('emailChanged');
      state.emailForm.ok = true;
      showToast(state.emailForm.message);
    }).catch(function (error) {
      state.emailForm.message = error && error.message ? error.message : t('error');
      state.emailForm.ok = false;
    }).then(function () {
      state.busy = false;
      render();
    });
  }

  function submitPassword() {
    if (state.busy) return;
    var currentPassword = state.passwordForm.current || '';
    var newPassword = state.passwordForm.next || '';
    if (!currentPassword || !newPassword) {
      state.passwordForm.message = t('fillAll');
      state.passwordForm.ok = false;
      render();
      return;
    }
    if (newPassword.length < 6) {
      state.passwordForm.message = t('passwordMin');
      state.passwordForm.ok = false;
      render();
      return;
    }
    state.busy = true;
    state.passwordForm.message = '';
    render();

    api('/api/account/password', {
      method: 'PUT',
      body: JSON.stringify({ currentPassword: currentPassword, newPassword: newPassword })
    }).then(function () {
      state.passwordForm.current = '';
      state.passwordForm.next = '';
      state.passwordForm.message = t('passwordChanged');
      state.passwordForm.ok = true;
      showToast(state.passwordForm.message);
    }).catch(function (error) {
      state.passwordForm.message = error && error.message ? error.message : t('error');
      state.passwordForm.ok = false;
    }).then(function () {
      state.busy = false;
      render();
    });
  }

  function submitForgotRequest() {
    if (state.busy) return;
    var email = String(state.forgot.email || '').trim();
    if (!email) {
      state.forgot.message = t('fillAll');
      state.forgot.ok = false;
      render();
      return;
    }
    state.busy = true;
    state.forgot.message = '';
    render();

    api('/api/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email: email })
    }).then(function (result) {
      state.forgot.message = (result && result.message) || t('forgotHint');
      state.forgot.ok = true;
      state.forgot.done = false;
      if (result && result.resetToken) {
        state.forgot.token = String(result.resetToken);
        state.forgot.stage = 'reset';
      }
    }).catch(function (error) {
      state.forgot.message = error && error.message ? error.message : t('error');
      state.forgot.ok = false;
    }).then(function () {
      state.busy = false;
      render();
    });
  }

  function submitForgotReset() {
    if (state.busy) return;
    var token = String(state.forgot.token || '').trim();
    var password = state.forgot.password || '';
    if (!token || !password) {
      state.forgot.message = t('fillAll');
      state.forgot.ok = false;
      render();
      return;
    }
    if (password.length < 6) {
      state.forgot.message = t('passwordMin');
      state.forgot.ok = false;
      render();
      return;
    }
    state.busy = true;
    state.forgot.message = '';
    state.forgot.done = false;
    render();

    api('/api/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token: token, password: password })
    }).then(function () {
      state.forgot.password = '';
      state.forgot.message = t('passwordReset');
      state.forgot.ok = true;
      state.forgot.done = true;
      showToast(state.forgot.message);
    }).catch(function (error) {
      state.forgot.message = error && error.message ? error.message : t('error');
      state.forgot.ok = false;
      state.forgot.done = false;
    }).then(function () {
      state.busy = false;
      render();
    });
  }

  function onClick(event) {
    var el = event.target && event.target.closest ? event.target.closest('[data-action]') : null;
    if (!el || !app.contains(el) || el.disabled) return;
    var action = el.getAttribute('data-action');

    switch (action) {
      case 'nav':
        go(el.getAttribute('data-path') || '/');
        break;
      case 'toggle-lang':
        toggleLang();
        break;
      case 'auth-tab':
        state.auth.mode = el.getAttribute('data-mode') === 'register' ? 'register' : 'login';
        state.auth.error = '';
        render();
        break;
      case 'auth-switch':
        state.auth.mode = state.auth.mode === 'login' ? 'register' : 'login';
        state.auth.error = '';
        render();
        break;
      case 'pick':
        handlePick(el.getAttribute('data-value'));
        break;
      case 'confirm-birth':
        confirmBirth();
        break;
      case 'confirm-dates':
        confirmDates();
        break;
      case 'confirm-neuter':
        confirmNeuter();
        break;
      case 'add-another':
        addAnother();
        break;
      case 'logout':
        clearAuth();
        go('/login', true);
        break;
      case 'go-login':
        clearAuth();
        go('/login', true);
        break;
      default:
        break;
    }
  }

  function onSubmit(event) {
    var form = event.target;
    if (!form || !form.getAttribute || !form.getAttribute('data-form')) return;
    event.preventDefault();
    readForm(form);
    switch (form.getAttribute('data-form')) {
      case 'auth': submitAuth(); break;
      case 'name': submitName(); break;
      case 'email': submitEmail(); break;
      case 'password': submitPassword(); break;
      case 'forgot-request': submitForgotRequest(); break;
      case 'forgot-reset': submitForgotReset(); break;
      default: break;
    }
  }

  function installIOSBackGesture() {
    if (!/iPhone|iPad|iPod/i.test(navigator.userAgent)) return;
    var startX = 0;
    var startY = 0;
    var tracking = false;

    document.addEventListener('touchstart', function (event) {
      if (event.touches.length !== 1) { tracking = false; return; }
      var touch = event.touches[0];
      if (touch.clientX > 24) { tracking = false; return; }
      tracking = true;
      startX = touch.clientX;
      startY = touch.clientY;
    }, { passive: true });

    document.addEventListener('touchmove', function (event) {
      if (!tracking || event.touches.length !== 1) return;
      var touch = event.touches[0];
      var dx = touch.clientX - startX;
      var dy = Math.abs(touch.clientY - startY);
      if (dx >= 48 && dx > dy * 1.5) {
        tracking = false;
        history.back();
      }
    }, { passive: true });

    function endGesture() { tracking = false; }
    document.addEventListener('touchend', endGesture, { passive: true });
    document.addEventListener('touchcancel', endGesture, { passive: true });
  }

  function boot() {
    applyLang();
    initChat();

    if (window.AndroidBars && typeof window.AndroidBars.getTopInsetDp === 'function') {
      try {
        window.__fureverTopInset(window.AndroidBars.getTopInsetDp());
      } catch (error) {
        /* bridge may not be ready */
      }
    }

    app.addEventListener('click', onClick);
    app.addEventListener('submit', onSubmit);
    app.addEventListener('input', onFieldInput);
    app.addEventListener('change', onFieldInput);

    window.addEventListener('popstate', function () { syncRoute(true); });
    window.addEventListener('hashchange', function () { syncRoute(false); });

    installIOSBackGesture();
    syncRoute(false);
  }

  boot();
})();
