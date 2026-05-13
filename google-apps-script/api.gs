  /**
  * SimulaENCAPS - API REST para Google Apps Script
  * Examen Nacional de Competencias para Atención Primaria de Salud (MINSA)
  *
  * INSTRUCCIONES DE CONFIGURACIÓN:
  * 1. Crear un nuevo proyecto en Google Apps Script (script.google.com)
  * 2. Copiar este código en el archivo Code.gs
  * 3. Actualizar SPREADSHEET_ID con el ID de tu Google Sheets
  * 4. Implementar como aplicación web:
  *    - Extensiones > Apps Script > Implementar > Nueva implementación
  *    - Tipo: Aplicación web
  *    - Ejecutar como: Yo
  *    - Quién tiene acceso: Cualquier persona
  * 5. Copiar la URL generada y usarla en el frontend
  *
  * Ver SHEETS_SETUP.md para la estructura completa del Spreadsheet.
  */

  // ============================================
  // CONFIGURACIÓN - ACTUALIZAR CON TU SPREADSHEET
  // ============================================
  const SPREADSHEET_ID = '1E-R5LQobXfReXJSWrEpcwH2-givVzyJLLNhuD0ot1_o';

  // Configuración de bloques ENCAPS (5 bloques, 100 preguntas total)
  const BLOCK_CONFIG = {
    'Salud Pública':       { code: 1, questionCount: 20, sheetName: 'Banco_SaludPublica' },
    'Atención Integral':   { code: 2, questionCount: 25, sheetName: 'Banco_AtencionIntegral' },
    'Ética':               { code: 3, questionCount: 15, sheetName: 'Banco_Etica' },
    'Investigación':       { code: 4, questionCount: 15, sheetName: 'Banco_Investigacion' },
    'Administración':      { code: 5, questionCount: 25, sheetName: 'Banco_Administracion' }
  };

  // Orden de bloques para el examen
  const BLOCK_ORDER = [
    'Salud Pública',
    'Atención Integral',
    'Ética',
    'Investigación',
    'Administración'
  ];

  // ============================================
  // FUNCIÓN PRINCIPAL - ENDPOINT REST (GET)
  // ============================================
  function doGet(e) {
    try {
      const action = e.parameter.action;
      let result;

      switch (action) {
        case 'config':
          result = getConfig();
          break;
        case 'questions':
          result = getQuestions();
          break;
        case 'register':
          const dni = e.parameter.dni || '';
          const fullName = e.parameter.fullName || '';
          const email = e.parameter.email || '';
          const phone = e.parameter.phone || '';
          const establecimiento = e.parameter.establecimiento || '';
          const region = e.parameter.region || '';
          const cargo = e.parameter.cargo || '';
          result = registerUser(dni, fullName, email, phone, establecimiento, region, cargo);
          break;
        case 'saveScore':
          const scoreDni = e.parameter.dni || '';
          const correctAnswers = parseInt(e.parameter.correctAnswers) || 0;
          const totalQuestions = parseInt(e.parameter.totalQuestions) || 100;
          const rawScore = parseInt(e.parameter.rawScore) || 0;
          const nencParam = parseFloat(e.parameter.nenc);
          const pppParam = e.parameter.ppp !== undefined && e.parameter.ppp !== '' ? parseFloat(e.parameter.ppp) : null;
          const pfParam = e.parameter.pf !== undefined && e.parameter.pf !== '' ? parseFloat(e.parameter.pf) : null;
          result = saveUserScore(scoreDni, correctAnswers, totalQuestions, rawScore, nencParam, pppParam, pfParam);
          break;
        case 'getHistory':
          const historyDni = e.parameter.dni || '';
          if (!historyDni) {
            return createErrorResponse('Parámetro "dni" requerido');
          }
          result = getUserHistory(historyDni);
          break;
        case 'checkAccess':
          const accessDni = e.parameter.dni || '';
          const accessEmail = e.parameter.email || '';
          if (!accessDni) {
            return createErrorResponse('Parámetro "dni" requerido');
          }
          result = checkUserAccess(accessDni, accessEmail);
          break;
        case 'checkBanqueoAccess':
          const banqueoDni = e.parameter.dni || '';
          const banqueoEmail = e.parameter.email || '';
          if (!banqueoDni) {
            return createErrorResponse('Parámetro "dni" requerido');
          }
          result = checkBanqueoAccess(banqueoDni, banqueoEmail);
          break;
        case 'getBanqueoQuestions':
          const blockName = e.parameter.block || e.parameter.course || '';
          const subAreaFilter = e.parameter.subArea || '';
          if (!blockName) {
            return createErrorResponse('Parámetro "block" requerido');
          }
          result = getBanqueoQuestions(blockName, subAreaFilter);
          break;
        case 'getEstructura':
          result = getEstructura();
          break;
        case 'getFlashcards':
          const flashBlock = e.parameter.block || '';
          const flashSubArea = e.parameter.subArea || '';
          result = getFlashcards(flashBlock, flashSubArea);
          break;
        case 'getTestimonios':
          result = getTestimonios();
          break;
        case 'logAnswers':
          // Soporte para logAnswers via GET (batch pequeño en formato JSON string)
          const logDni = e.parameter.dni || '';
          const answersRaw = e.parameter.answers || '[]';
          if (!logDni) {
            return createErrorResponse('Parámetro "dni" requerido');
          }
          let parsedAnswers;
          try {
            parsedAnswers = JSON.parse(answersRaw);
          } catch (err) {
            return createErrorResponse('Parámetro "answers" no es JSON válido');
          }
          result = logAnswers(logDni, parsedAnswers);
          break;
        case 'getIncorrectQuestions':
          const incorrectDni = e.parameter.dni || '';
          if (!incorrectDni) {
            return createErrorResponse('Parámetro "dni" requerido');
          }
          result = getIncorrectQuestions(incorrectDni);
          break;
        case 'getProgress':
          const progressDni = e.parameter.dni || '';
          if (!progressDni) {
            return createErrorResponse('Parámetro "dni" requerido');
          }
          result = getProgress(progressDni);
          break;
        case 'getQuestionStats':
          const statsQuestionId = e.parameter.questionId || '';
          if (!statsQuestionId) {
            return createErrorResponse('Parámetro "questionId" requerido');
          }
          result = getQuestionStats(statsQuestionId);
          break;
        case 'test':
          result = { status: 'ok', message: 'SimulaENCAPS API funcionando correctamente', timestamp: new Date().toISOString() };
          break;
        default:
          return createErrorResponse('Acción no válida. Use: config, questions, register, saveScore, getHistory, checkAccess, checkBanqueoAccess, getBanqueoQuestions, getEstructura, getFlashcards, getTestimonios, logAnswers, getIncorrectQuestions, getProgress, getQuestionStats, o test');
      }

      return createSuccessResponse(result);

    } catch (error) {
      return createErrorResponse(error.toString());
    }
  }

  // ============================================
  // FUNCIÓN PRINCIPAL - ENDPOINT REST (POST)
  // Para batch grande de logAnswers vía JSON body
  // ============================================
  function doPost(e) {
    try {
      const action = (e && e.parameter && e.parameter.action) || '';

      // Validar body JSON
      let payload = {};
      const rawBody = e && e.postData && e.postData.contents ? e.postData.contents : '';
      if (rawBody) {
        try {
          payload = JSON.parse(rawBody);
        } catch (err) {
          return createErrorResponse('Body no es JSON válido');
        }
      }

      const effectiveAction = action || payload.action || '';

      let result;
      switch (effectiveAction) {
        case 'logAnswers':
          const dni = payload.dni || (e.parameter && e.parameter.dni) || '';
          const answers = Array.isArray(payload.answers) ? payload.answers : [];
          if (!dni) {
            return createErrorResponse('Campo "dni" requerido en el body');
          }
          if (!Array.isArray(answers) || answers.length === 0) {
            return createErrorResponse('Campo "answers" debe ser un array no vacío');
          }
          result = logAnswers(dni, answers);
          break;
        default:
          return createErrorResponse('Acción POST no válida. Use: logAnswers');
      }

      return createSuccessResponse(result);

    } catch (error) {
      return createErrorResponse(error.toString());
    }
  }

  // ============================================
  // FUNCIONES DE RESPUESTA
  // ============================================
  function createSuccessResponse(data) {
    return ContentService
      .createTextOutput(JSON.stringify({ success: true, data: data }))
      .setMimeType(ContentService.MimeType.JSON);
  }

  function createErrorResponse(message) {
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, error: message }))
      .setMimeType(ContentService.MimeType.JSON);
  }

  // ============================================
  // OBTENER CONFIGURACIÓN DEL EXAMEN ENCAPS
  // ============================================
  function getConfig() {
    const blocks = BLOCK_ORDER.map(blockName => ({
      code: BLOCK_CONFIG[blockName].code,
      name: blockName,
      questionCount: BLOCK_CONFIG[blockName].questionCount
    }));

    const totalQuestions = blocks.reduce((sum, b) => sum + b.questionCount, 0);

    return {
      totalQuestions: totalQuestions,
      maxScore: totalQuestions, // 1 punto por pregunta
      blocks: blocks
    };
  }

  // ============================================
  // OBTENER PREGUNTAS DEL EXAMEN ENCAPS
  // (100 preguntas: 20+25+15+15+25, ordenadas por bloque)
  // ============================================
  function getQuestions() {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const questions = [];
    let questionNumber = 1;

    // Recorrer bloques en orden
    for (const blockName of BLOCK_ORDER) {
      const config = BLOCK_CONFIG[blockName];
      const blockQuestions = getRandomQuestionsFromBlock(ss, blockName, config, questionNumber);
      questions.push(...blockQuestions);
      questionNumber += blockQuestions.length;
    }

    // NO mezclar - mantener orden por bloque
    return questions;
  }

  // ============================================
  // OBTENER PREGUNTAS ALEATORIAS DE UN BLOQUE
  // ============================================
  function getRandomQuestionsFromBlock(ss, blockName, config, startingNumber) {
    const sheet = ss.getSheetByName(config.sheetName);
    if (!sheet) {
      console.log(`Advertencia: Hoja "${config.sheetName}" no encontrada`);
      return [];
    }

    const data = sheet.getDataRange().getValues();
    if (data.length <= 1) return []; // Solo encabezado o vacía

    const headers = data[0];
    const colIndices = getBankColumnIndices(headers);

    // Obtener todas las preguntas válidas
    const allQuestions = [];
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      const questionText = row[colIndices.questionText];
      if (!questionText || questionText === '') continue;
      allQuestions.push({ rowIndex: i, data: row });
    }

    // Seleccionar N preguntas aleatorias
    const selectedQuestions = selectRandomItems(allQuestions, config.questionCount);

    // Formatear preguntas (1 punto por correcta en ENCAPS)
    return selectedQuestions.map((q, index) =>
      formatQuestionRow(q, colIndices, blockName, startingNumber + index)
    );
  }

  /**
  * Obtiene los índices de columnas estándar de un banco de preguntas.
  * Estructura: A:Question Text | B:Question Type | C-G:Option 1..5 |
  * H:Correct Answer | I:Time in seconds | J:Image Link | K:NUMERO |
  * L:SUB-AREA | M:TEMA | N:SUBTEMA | O:NOMBRE DEL ARCHIVO |
  * P:JUSTIFICACION | Q:NIVEL | R:REFERENCIA NORMATIVA
  */
  function getBankColumnIndices(headers) {
    return {
      questionText: headers.indexOf('Question Text'),
      questionType: headers.indexOf('Question Type'),
      option1: headers.indexOf('Option 1'),
      option2: headers.indexOf('Option 2'),
      option3: headers.indexOf('Option 3'),
      option4: headers.indexOf('Option 4'),
      option5: headers.indexOf('Option 5'),
      correctAnswer: headers.indexOf('Correct Answer'),
      timeSeconds: headers.indexOf('Time in seconds'),
      imageLink: headers.indexOf('Image Link'),
      numero: headers.indexOf('NUMERO'),
      subArea: headers.indexOf('SUB-AREA'),
      tema: headers.indexOf('TEMA'),
      subtema: headers.indexOf('SUBTEMA'),
      sourceFile: headers.indexOf('NOMBRE DEL ARCHIVO'),
      justification: headers.indexOf('JUSTIFICACION'),
      nivel: headers.indexOf('NIVEL'),
      referenciaNormativa: headers.indexOf('REFERENCIA NORMATIVA')
    };
  }

  /**
  * Construye el objeto pregunta estándar a partir de una fila.
  */
  function formatQuestionRow(q, colIndices, blockName, number) {
    const row = q.data;

    const options = [
      row[colIndices.option1],
      row[colIndices.option2],
      row[colIndices.option3],
      row[colIndices.option4],
      row[colIndices.option5]
    ].filter(opt => opt !== undefined && opt !== null && opt !== '');

    const correctAnswerIndex = (parseInt(row[colIndices.correctAnswer]) || 1) - 1;
    const timeSeconds = (colIndices.timeSeconds >= 0 && row[colIndices.timeSeconds])
      ? parseInt(row[colIndices.timeSeconds]) || 180
      : 180;

    return {
      id: `${blockName}-${q.rowIndex}`,
      number: number,
      questionText: row[colIndices.questionText],
      questionType: row[colIndices.questionType] || 'Caso Clínico',
      options: options,
      correctAnswer: correctAnswerIndex,
      timeSeconds: timeSeconds,
      imageLink: (colIndices.imageLink >= 0 ? row[colIndices.imageLink] : null) || null,
      block: blockName,
      subArea: (colIndices.subArea >= 0 ? row[colIndices.subArea] : '') || '',
      points: 1,
      sourceFile: (colIndices.sourceFile >= 0 ? row[colIndices.sourceFile] : null) || null,
      justification: (colIndices.justification >= 0 ? row[colIndices.justification] : null) || null,
      referenciaNormativa: (colIndices.referenciaNormativa >= 0 ? row[colIndices.referenciaNormativa] : '') || '',
      nivel: (colIndices.nivel >= 0 ? row[colIndices.nivel] : '') || '',
      metadata: {
        numero: colIndices.numero >= 0 ? row[colIndices.numero] : '',
        tema: colIndices.tema >= 0 ? row[colIndices.tema] : '',
        subtema: colIndices.subtema >= 0 ? row[colIndices.subtema] : ''
      }
    };
  }

  // ============================================
  // FUNCIONES AUXILIARES
  // ============================================

  /**
  * Mezcla un array usando el algoritmo Fisher-Yates
  */
  function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  /**
  * Selecciona N elementos aleatorios de un array
  */
  function selectRandomItems(array, count) {
    if (count >= array.length) {
      return shuffleArray(array);
    }
    const shuffled = shuffleArray(array);
    return shuffled.slice(0, count);
  }

  // ============================================
  // REGISTRO DE USUARIOS
  // ============================================

  /**
  * Registra un usuario en la hoja "usuarios"
  * Columnas: Fecha | DNI | Nombre | Email | Celular | Establecimiento | Region | Cargo
  */
  function registerUser(dni, fullName, email, phone, establecimiento, region, cargo) {
    if (!dni) {
      return { registered: false, message: 'DNI requerido' };
    }

    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    let sheet = ss.getSheetByName('usuarios');

    // Crear hoja si no existe
    if (!sheet) {
      sheet = ss.insertSheet('usuarios');
      sheet.appendRow(['Fecha', 'DNI', 'Nombre', 'Email', 'Celular', 'Establecimiento', 'Region', 'Cargo']);
      sheet.getRange(1, 1, 1, 8).setFontWeight('bold');
      sheet.setColumnWidth(1, 150);
      sheet.setColumnWidth(3, 250);
      sheet.setColumnWidth(4, 220);
      sheet.setColumnWidth(6, 280);
      sheet.setColumnWidth(7, 180);
      sheet.setColumnWidth(8, 180);
    }

    // Buscar si el DNI ya existe
    const data = sheet.getDataRange().getValues();
    let existingRow = -1;

    for (let i = 1; i < data.length; i++) {
      if (data[i][1] === dni || data[i][1] === parseInt(dni)) {
        existingRow = i + 1;
        break;
      }
    }

    const timestamp = new Date();

    if (existingRow > 0) {
      // Usuario existe - actualizar datos
      const oldEmail = data[existingRow - 1][3];
      const oldPhone = data[existingRow - 1][4];
      const oldEstab = data[existingRow - 1][5];
      const oldRegion = data[existingRow - 1][6];
      const oldCargo = data[existingRow - 1][7];

      if (email !== oldEmail || phone !== oldPhone ||
          establecimiento !== oldEstab || region !== oldRegion || cargo !== oldCargo) {
        sheet.getRange(existingRow, 1).setValue(timestamp);
        sheet.getRange(existingRow, 4).setValue(email);
        sheet.getRange(existingRow, 5).setValue(phone);
        sheet.getRange(existingRow, 6).setValue(establecimiento);
        sheet.getRange(existingRow, 7).setValue(region);
        sheet.getRange(existingRow, 8).setValue(cargo);
        return { registered: true, message: 'Datos actualizados', updated: true };
      }

      return { registered: true, message: 'Usuario ya registrado', existing: true };
    }

    // Usuario nuevo
    sheet.appendRow([timestamp, dni, fullName, email, phone, establecimiento, region, cargo]);

    return { registered: true, message: 'Usuario registrado', new: true };
  }

  // ============================================
  // HISTORIAL DE PUNTAJES
  // ============================================

  /**
  * Guarda el puntaje de un usuario en la hoja "historial_puntajes"
  * Columnas ENCAPS: DNI | Fecha | Correctas | Total | Puntaje | NENC | PPP | PF | Porcentaje
  *
  * NENC = (correctas / 100) * 20
  * PF   = (PPP * 0.3) + (NENC * 0.7)
  */
  function saveUserScore(dni, correctAnswers, totalQuestions, rawScore, nenc, ppp, pf) {
    if (!dni) {
      return { saved: false, message: 'DNI requerido' };
    }

    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    let sheet = ss.getSheetByName('historial_puntajes');

    // Crear hoja si no existe
    if (!sheet) {
      sheet = ss.insertSheet('historial_puntajes');
      sheet.appendRow(['DNI', 'Fecha', 'Correctas', 'Total', 'Puntaje', 'NENC', 'PPP', 'PF', 'Porcentaje']);
      sheet.getRange(1, 1, 1, 9).setFontWeight('bold');
      sheet.setColumnWidth(1, 100);
      sheet.setColumnWidth(2, 150);
    }

    // Calcular NENC si no se envió
    const nencValue = (nenc !== null && nenc !== undefined && !isNaN(nenc))
      ? parseFloat(nenc)
      : (totalQuestions > 0 ? (correctAnswers / totalQuestions) * 20 : 0);

    // Calcular PF si llega PPP y no llega PF
    let pfValue = (pf !== null && pf !== undefined && !isNaN(pf)) ? parseFloat(pf) : null;
    const pppValue = (ppp !== null && ppp !== undefined && !isNaN(ppp)) ? parseFloat(ppp) : null;

    if (pfValue === null && pppValue !== null) {
      pfValue = (pppValue * 0.3) + (nencValue * 0.7);
    }

    // Calcular porcentaje
    const percentage = totalQuestions > 0 ? ((correctAnswers / totalQuestions) * 100).toFixed(1) : 0;

    const timestamp = new Date();
    sheet.appendRow([
      dni,
      timestamp,
      correctAnswers,
      totalQuestions,
      rawScore,
      nencValue.toFixed(2),
      pppValue !== null ? pppValue.toFixed(2) : '',
      pfValue !== null ? pfValue.toFixed(2) : '',
      percentage + '%'
    ]);

    return {
      saved: true,
      message: 'Puntaje guardado',
      nenc: parseFloat(nencValue.toFixed(2)),
      ppp: pppValue,
      pf: pfValue !== null ? parseFloat(pfValue.toFixed(2)) : null
    };
  }

  /**
  * Obtiene el historial de puntajes de un usuario por DNI
  */
  function getUserHistory(dni) {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = ss.getSheetByName('historial_puntajes');

    if (!sheet) {
      return { history: [], message: 'No hay historial disponible' };
    }

    const data = sheet.getDataRange().getValues();
    if (data.length <= 1) {
      return { history: [], message: 'No hay registros' };
    }

    // Buscar registros del usuario
    // Columnas: DNI | Fecha | Correctas | Total | Puntaje | NENC | PPP | PF | Porcentaje
    const history = [];
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      if (row[0] === dni || row[0] === parseInt(dni) || String(row[0]).trim() === String(dni).trim()) {
        history.push({
          fecha: row[1],
          correctas: parseInt(row[2]) || 0,
          total: parseInt(row[3]) || 100,
          puntaje: parseInt(row[4]) || 0,
          nenc: parseFloat(row[5]) || 0,
          ppp: row[6] !== '' && row[6] !== null && row[6] !== undefined ? parseFloat(row[6]) : null,
          pf: row[7] !== '' && row[7] !== null && row[7] !== undefined ? parseFloat(row[7]) : null,
          porcentaje: parseFloat(String(row[8]).replace('%', '')) || 0
        });
      }
    }

    // Ordenar por fecha (más reciente primero)
    history.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

    const mejorPuntaje = history.length > 0 ? Math.max(...history.map(h => h.puntaje)) : 0;
    const mejorNenc = history.length > 0 ? Math.max(...history.map(h => h.nenc)) : 0;
    const mejorPf = history.length > 0
      ? Math.max(...history.map(h => h.pf !== null ? h.pf : 0))
      : 0;

    return {
      dni: dni,
      totalIntentos: history.length,
      history: history,
      mejorPuntaje: mejorPuntaje,
      mejorNenc: mejorNenc,
      mejorPf: mejorPf,
      ultimoPuntaje: history.length > 0 ? history[0].puntaje : 0,
      ultimoNenc: history.length > 0 ? history[0].nenc : 0,
      ultimoPf: history.length > 0 ? history[0].pf : null
    };
  }

  // ============================================
  // VERIFICACIÓN DE ACCESO - DETECCIÓN DE FRAUDE
  // ============================================

  /**
  * Verifica si un usuario puede dar el examen con detección de fraude
  * - Primer examen: LIBRE para todos
  * - Segundo examen en adelante: Solo si está en hoja "confirmado"
  * - FRAUDE: Si el DNI o Email ya fueron usados con datos diferentes
  *
  * @param {string} dni - DNI del usuario
  * @param {string} email - Email del usuario
  * @returns {object} { canAccess, reason, attemptCount, isFraudAttempt }
  */
  function checkUserAccess(dni, email) {
    if (!dni) {
      return { canAccess: false, reason: 'DNI requerido', attemptCount: 0 };
    }

    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const emailLower = (email || '').toLowerCase().trim();

    // 1. Verificar en tabla "usuarios" si hay intento de fraude
    // Columnas: Fecha | DNI | Nombre | Email | Celular | Establecimiento | Region | Cargo
    const usersSheet = ss.getSheetByName('usuarios');
    let fraudAttempt = false;
    let fraudReason = '';

    if (usersSheet) {
      const usersData = usersSheet.getDataRange().getValues();

      for (let i = 1; i < usersData.length; i++) {
        const rowDni = String(usersData[i][1]).trim();
        const rowEmail = String(usersData[i][3] || '').toLowerCase().trim();

        // DNI igual con DIFERENTE email
        if ((rowDni === dni || rowDni === String(parseInt(dni))) && rowEmail !== '' && emailLower !== '') {
          if (rowEmail !== emailLower) {
            fraudAttempt = true;
            fraudReason = 'El usuario ya existe';
            break;
          }
        }

        // Email igual con DIFERENTE DNI
        if (rowEmail !== '' && emailLower !== '' && rowEmail === emailLower) {
          if (rowDni !== dni && rowDni !== String(parseInt(dni))) {
            fraudAttempt = true;
            fraudReason = 'El usuario ya existe';
            break;
          }
        }
      }
    }

    // 2. Contar intentos previos en historial_puntajes (por DNI O por Email)
    const historySheet = ss.getSheetByName('historial_puntajes');
    let attemptCountByDni = 0;
    let attemptCountByEmail = 0;

    if (historySheet && usersSheet) {
      const historyData = historySheet.getDataRange().getValues();
      const usersData = usersSheet.getDataRange().getValues();

      // Mapa DNI -> Email
      const dniToEmail = {};
      for (let i = 1; i < usersData.length; i++) {
        const uDni = String(usersData[i][1]).trim();
        const uEmail = String(usersData[i][3] || '').toLowerCase().trim();
        if (uDni && uEmail) {
          dniToEmail[uDni] = uEmail;
        }
      }

      for (let i = 1; i < historyData.length; i++) {
        const histDni = String(historyData[i][0]).trim();
        if (histDni === dni || histDni === String(parseInt(dni))) {
          attemptCountByDni++;
        }
        if (emailLower !== '' && dniToEmail[histDni] === emailLower) {
          attemptCountByEmail++;
        }
      }
    }

    const attemptCount = Math.max(attemptCountByDni, attemptCountByEmail);

    // 3. Si detectamos fraude, denegar acceso
    if (fraudAttempt) {
      return {
        canAccess: false,
        reason: fraudReason,
        attemptCount: attemptCount,
        isFirstAttempt: false,
        isConfirmed: false,
        isFraudAttempt: true
      };
    }

    // 4. Primer intento -> libre
    if (attemptCount === 0) {
      return {
        canAccess: true,
        reason: 'Primer examen gratuito',
        attemptCount: attemptCount,
        isFirstAttempt: true,
        isFraudAttempt: false
      };
    }

    // 5. Segundo intento+ -> verificar hoja "confirmado"
    let confirmadoSheet = ss.getSheetByName('confirmado');

    if (!confirmadoSheet) {
      confirmadoSheet = ss.insertSheet('confirmado');
      confirmadoSheet.appendRow(['DNI', 'Nombre', 'Email']);
      confirmadoSheet.getRange(1, 1, 1, 3).setFontWeight('bold');
      confirmadoSheet.setColumnWidth(1, 100);
      confirmadoSheet.setColumnWidth(2, 250);
      confirmadoSheet.setColumnWidth(3, 220);
    }

    const confirmadoData = confirmadoSheet.getDataRange().getValues();
    let isConfirmed = false;

    for (let i = 1; i < confirmadoData.length; i++) {
      const confDni = String(confirmadoData[i][0]).trim();
      const confEmail = String(confirmadoData[i][2] || '').toLowerCase().trim();

      const dniMatch = (confDni === dni || confDni === String(parseInt(dni)));
      const emailMatch = (confEmail === emailLower) || (confEmail === '' && emailLower === '');

      if (dniMatch && emailMatch) {
        isConfirmed = true;
        break;
      }
    }

    if (isConfirmed) {
      return {
        canAccess: true,
        reason: 'Usuario confirmado',
        attemptCount: attemptCount,
        isFirstAttempt: false,
        isConfirmed: true,
        isFraudAttempt: false
      };
    }

    return {
      canAccess: false,
      reason: 'Requiere inscripción para más intentos',
      attemptCount: attemptCount,
      isFirstAttempt: false,
      isConfirmed: false,
      isFraudAttempt: false
    };
  }

  // ============================================
  // BANQUEO HISTÓRICO - SOLO USUARIOS CONFIRMADOS
  // ============================================

  /**
  * Verifica si un usuario puede acceder al Banqueo Histórico
  * SOLO usuarios confirmados (NO hay intento gratis)
  */
  function checkBanqueoAccess(dni, email) {
    if (!dni) {
      return { canAccess: false, reason: 'DNI requerido' };
    }

    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const emailLower = (email || '').toLowerCase().trim();

    let confirmadoSheet = ss.getSheetByName('confirmado');

    if (!confirmadoSheet) {
      return {
        canAccess: false,
        reason: 'El Banqueo Histórico es exclusivo para usuarios inscritos',
        isConfirmed: false
      };
    }

    const confirmadoData = confirmadoSheet.getDataRange().getValues();
    let isConfirmed = false;

    for (let i = 1; i < confirmadoData.length; i++) {
      const confDni = String(confirmadoData[i][0]).trim();
      const confEmail = String(confirmadoData[i][2] || '').toLowerCase().trim();

      const dniMatch = (confDni === dni || confDni === String(parseInt(dni)));
      const emailMatch = (confEmail === emailLower) || (confEmail === '' && emailLower === '');

      if (dniMatch && emailMatch) {
        isConfirmed = true;
        break;
      }
    }

    if (isConfirmed) {
      return {
        canAccess: true,
        reason: 'Acceso autorizado al Banqueo Histórico',
        isConfirmed: true
      };
    }

    return {
      canAccess: false,
      reason: 'El Banqueo Histórico es exclusivo para usuarios inscritos',
      isConfirmed: false
    };
  }

  /**
  * Obtiene 10 preguntas aleatorias de un bloque específico para el Banqueo
  *
  * @param {string} blockName - Nombre del bloque (ej: 'Salud Pública')
  * @param {string} subArea  - (opcional) Filtra por sub-área
  * @returns {object} { block, totalQuestions, questions }
  */
  function getBanqueoQuestions(blockName, subArea) {
    if (!BLOCK_CONFIG[blockName]) {
      return { error: 'Bloque no válido', questions: [] };
    }

    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const config = BLOCK_CONFIG[blockName];
    const sheet = ss.getSheetByName(config.sheetName);

    if (!sheet) {
      return { error: 'Banco de preguntas no encontrado', questions: [] };
    }

    const data = sheet.getDataRange().getValues();
    if (data.length <= 1) {
      return { error: 'No hay preguntas disponibles', questions: [] };
    }

    const headers = data[0];
    const colIndices = getBankColumnIndices(headers);
    const subAreaFilter = (subArea || '').toString().trim().toLowerCase();

    const allQuestions = [];
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      const questionText = row[colIndices.questionText];
      if (!questionText || questionText === '') continue;

      // Filtro opcional por sub-área
      if (subAreaFilter !== '') {
        const rowSubArea = String(colIndices.subArea >= 0 ? (row[colIndices.subArea] || '') : '').trim().toLowerCase();
        if (rowSubArea !== subAreaFilter) continue;
      }

      allQuestions.push({ rowIndex: i, data: row });
    }

    const selectedQuestions = selectRandomItems(allQuestions, 10);

    const questions = selectedQuestions.map((q, index) => {
      const formatted = formatQuestionRow(q, colIndices, blockName, index + 1);
      // Para banqueo, prefijar id
      formatted.id = `banqueo-${formatted.id}`;
      return formatted;
    });

    return {
      block: blockName,
      subArea: subArea || null,
      totalQuestions: questions.length,
      questions: questions
    };
  }

  // ============================================
  // ESTRUCTURA ENCAPS
  // ============================================

  /**
  * Lee la hoja "Estructura_ENCAPS" y devuelve la estructura agrupada por bloque.
  * Columnas: BLOQUE | SUB-AREA | TEMA | NUM_PREGUNTAS | PUNTAJE_EST
  */
  function getEstructura() {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    let sheet = ss.getSheetByName('Estructura_ENCAPS');

    if (!sheet) {
      sheet = ss.insertSheet('Estructura_ENCAPS');
      sheet.appendRow(['BLOQUE', 'SUB-AREA', 'TEMA', 'NUM_PREGUNTAS', 'PUNTAJE_EST']);
      sheet.getRange(1, 1, 1, 5).setFontWeight('bold');
      return { estructura: [], grouped: {}, message: 'Hoja Estructura_ENCAPS creada vacía' };
    }

    const data = sheet.getDataRange().getValues();
    if (data.length <= 1) {
      return { estructura: [], grouped: {}, message: 'Sin datos' };
    }

    const flat = [];
    const grouped = {};

    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      const bloque = String(row[0] || '').trim();
      if (!bloque) continue;

      const item = {
        bloque: bloque,
        subArea: String(row[1] || '').trim(),
        tema: String(row[2] || '').trim(),
        numPreguntas: parseInt(row[3]) || 0,
        puntajeEst: parseFloat(row[4]) || 0
      };

      flat.push(item);
      if (!grouped[bloque]) grouped[bloque] = [];
      grouped[bloque].push(item);
    }

    return {
      estructura: flat,
      grouped: grouped
    };
  }

  // ============================================
  // FLASHCARDS
  // ============================================

  /**
  * Lee la hoja "flashcards", filtrando por block y/o subArea.
  * Columnas: ID | Bloque | SubArea | Tema | Frente | Reverso | Referencia
  */
  function getFlashcards(block, subArea) {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    let sheet = ss.getSheetByName('flashcards');

    if (!sheet) {
      sheet = ss.insertSheet('flashcards');
      sheet.appendRow(['ID', 'Bloque', 'SubArea', 'Tema', 'Frente', 'Reverso', 'Referencia']);
      sheet.getRange(1, 1, 1, 7).setFontWeight('bold');
      return { flashcards: [], message: 'Hoja flashcards creada vacía' };
    }

    const data = sheet.getDataRange().getValues();
    if (data.length <= 1) {
      return { flashcards: [] };
    }

    const blockFilter = (block || '').toString().trim().toLowerCase();
    const subAreaFilter = (subArea || '').toString().trim().toLowerCase();

    const flashcards = [];
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      const id = row[0];
      if (id === '' || id === null || id === undefined) continue;

      const rowBlock = String(row[1] || '').trim();
      const rowSubArea = String(row[2] || '').trim();

      if (blockFilter !== '' && rowBlock.toLowerCase() !== blockFilter) continue;
      if (subAreaFilter !== '' && rowSubArea.toLowerCase() !== subAreaFilter) continue;

      flashcards.push({
        id: id,
        block: rowBlock,
        subArea: rowSubArea,
        tema: String(row[3] || '').trim(),
        frente: String(row[4] || ''),
        reverso: String(row[5] || ''),
        referencia: String(row[6] || '')
      });
    }

    return { flashcards: flashcards, total: flashcards.length };
  }

  // ============================================
  // TESTIMONIOS
  // ============================================

  /**
  * Lee la hoja "testimonios" donde Aprobado = TRUE
  * Columnas: Fecha | Nombre | Establecimiento | Region | Texto | Aprobado (bool)
  */
  function getTestimonios() {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    let sheet = ss.getSheetByName('testimonios');

    if (!sheet) {
      sheet = ss.insertSheet('testimonios');
      sheet.appendRow(['Fecha', 'Nombre', 'Establecimiento', 'Region', 'Texto', 'Aprobado']);
      sheet.getRange(1, 1, 1, 6).setFontWeight('bold');
      return { testimonios: [], message: 'Hoja testimonios creada vacía' };
    }

    const data = sheet.getDataRange().getValues();
    if (data.length <= 1) {
      return { testimonios: [] };
    }

    const testimonios = [];
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      const aprobado = row[5];
      const isApproved = (aprobado === true) ||
                         (String(aprobado).toUpperCase() === 'TRUE') ||
                         (String(aprobado).toUpperCase() === 'SI') ||
                         (String(aprobado).toUpperCase() === 'SÍ');
      if (!isApproved) continue;

      testimonios.push({
        fecha: row[0],
        nombre: String(row[1] || '').trim(),
        establecimiento: String(row[2] || '').trim(),
        region: String(row[3] || '').trim(),
        texto: String(row[4] || '')
      });
    }

    // Más recientes primero
    testimonios.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

    return { testimonios: testimonios, total: testimonios.length };
  }

  // ============================================
  // LOG DE RESPUESTAS (para analítica y revisión)
  // ============================================

  /**
  * Appendea respuestas a la hoja "respuestas_log"
  * Columnas: DNI | Fecha | QuestionID | Bloque | SubArea | Correcta (bool) | RespuestaElegida (1-5)
  *
  * @param {string} dni
  * @param {Array<{questionId, block, subArea, correcta, respuestaElegida}>} answers
  */
  function logAnswers(dni, answers) {
    if (!dni) {
      return { saved: false, message: 'DNI requerido' };
    }
    if (!Array.isArray(answers) || answers.length === 0) {
      return { saved: false, message: 'answers debe ser un array no vacío' };
    }

    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    let sheet = ss.getSheetByName('respuestas_log');

    if (!sheet) {
      sheet = ss.insertSheet('respuestas_log');
      sheet.appendRow(['DNI', 'Fecha', 'QuestionID', 'Bloque', 'SubArea', 'Correcta', 'RespuestaElegida']);
      sheet.getRange(1, 1, 1, 7).setFontWeight('bold');
    }

    const timestamp = new Date();
    const rows = answers.map(a => {
      const correcta = a.correcta === true || String(a.correcta).toLowerCase() === 'true';
      const elegida = parseInt(a.respuestaElegida);
      return [
        dni,
        timestamp,
        a.questionId || '',
        a.block || '',
        a.subArea || '',
        correcta,
        isNaN(elegida) ? '' : elegida
      ];
    });

    // Append en bloque
    const startRow = sheet.getLastRow() + 1;
    sheet.getRange(startRow, 1, rows.length, 7).setValues(rows);

    return {
      saved: true,
      message: 'Respuestas registradas',
      count: rows.length
    };
  }

  // ============================================
  // PREGUNTAS INCORRECTAS DEL USUARIO
  // ============================================

  /**
  * Devuelve las preguntas que el usuario respondió incorrectamente,
  * recuperando los datos completos de los bancos.
  * Máx 100 preguntas.
  */
  function getIncorrectQuestions(dni) {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const logSheet = ss.getSheetByName('respuestas_log');

    if (!logSheet) {
      return { questions: [], total: 0, message: 'No hay respuestas registradas' };
    }

    const logData = logSheet.getDataRange().getValues();
    if (logData.length <= 1) {
      return { questions: [], total: 0 };
    }

    // Set de QuestionIDs incorrectos (únicos), conservando bloque
    const incorrectMap = {}; // questionId -> block
    const dniStr = String(dni).trim();

    for (let i = 1; i < logData.length; i++) {
      const row = logData[i];
      const rowDni = String(row[0]).trim();
      if (rowDni !== dniStr && rowDni !== String(parseInt(dni))) continue;

      const correcta = row[5] === true || String(row[5]).toUpperCase() === 'TRUE';
      if (correcta) continue;

      const qid = String(row[2] || '').trim();
      const blk = String(row[3] || '').trim();
      if (!qid) continue;

      incorrectMap[qid] = blk;
    }

    const incorrectIds = Object.keys(incorrectMap);
    if (incorrectIds.length === 0) {
      return { questions: [], total: 0, message: 'Sin preguntas incorrectas' };
    }

    // Agrupar por bloque para minimizar lecturas
    const byBlock = {};
    incorrectIds.forEach(qid => {
      const blk = incorrectMap[qid];
      // Si no hay bloque guardado, intentar parsear del id
      let resolvedBlock = blk;
      if (!resolvedBlock && qid.indexOf('-') > -1) {
        resolvedBlock = qid.substring(0, qid.lastIndexOf('-'));
      }
      if (!byBlock[resolvedBlock]) byBlock[resolvedBlock] = [];
      byBlock[resolvedBlock].push(qid);
    });

    const questions = [];

    Object.keys(byBlock).forEach(blockName => {
      const config = BLOCK_CONFIG[blockName];
      if (!config) return;

      const sheet = ss.getSheetByName(config.sheetName);
      if (!sheet) return;

      const data = sheet.getDataRange().getValues();
      if (data.length <= 1) return;

      const headers = data[0];
      const colIndices = getBankColumnIndices(headers);

      // Construir índice rowIndex -> formattedQuestion
      byBlock[blockName].forEach(qid => {
        // qid: `${blockName}-${rowIndex}`
        const sepIdx = qid.lastIndexOf('-');
        const rowIndex = parseInt(qid.substring(sepIdx + 1));
        if (isNaN(rowIndex) || rowIndex < 1 || rowIndex >= data.length) return;

        const row = data[rowIndex];
        if (!row[colIndices.questionText]) return;

        const formatted = formatQuestionRow(
          { rowIndex: rowIndex, data: row },
          colIndices,
          blockName,
          questions.length + 1
        );
        questions.push(formatted);
      });
    });

    // Limitar a 100
    const limited = questions.slice(0, 100);

    return {
      questions: limited,
      total: limited.length,
      totalDetected: incorrectIds.length
    };
  }

  // ============================================
  // PROGRESO DEL USUARIO
  // ============================================

  /**
  * Devuelve historial resumido + estadísticas por bloque desde respuestas_log
  */
  function getProgress(dni) {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const dniStr = String(dni).trim();

    // 1. History desde historial_puntajes
    const history = [];
    const historySheet = ss.getSheetByName('historial_puntajes');
    if (historySheet) {
      const hData = historySheet.getDataRange().getValues();
      for (let i = 1; i < hData.length; i++) {
        const row = hData[i];
        const rowDni = String(row[0]).trim();
        if (rowDni !== dniStr && rowDni !== String(parseInt(dni))) continue;

        const correctas = parseInt(row[2]) || 0;
        const total = parseInt(row[3]) || 100;
        const porcentaje = total > 0 ? (correctas / total) * 100 : 0;

        history.push({
          fecha: row[1],
          nenc: parseFloat(row[5]) || 0,
          pf: row[7] !== '' && row[7] !== null && row[7] !== undefined ? parseFloat(row[7]) : null,
          porcentaje: parseFloat(porcentaje.toFixed(1))
        });
      }
      history.sort((a, b) => new Date(a.fecha) - new Date(b.fecha));
    }

    // 2. Stats por bloque desde respuestas_log
    const statsByBlock = [];
    const logSheet = ss.getSheetByName('respuestas_log');
    if (logSheet) {
      const logData = logSheet.getDataRange().getValues();
      const accumulator = {}; // block -> { total, correctas }

      for (let i = 1; i < logData.length; i++) {
        const row = logData[i];
        const rowDni = String(row[0]).trim();
        if (rowDni !== dniStr && rowDni !== String(parseInt(dni))) continue;

        const block = String(row[3] || '').trim() || 'Sin bloque';
        const correcta = row[5] === true || String(row[5]).toUpperCase() === 'TRUE';

        if (!accumulator[block]) accumulator[block] = { total: 0, correctas: 0 };
        accumulator[block].total++;
        if (correcta) accumulator[block].correctas++;
      }

      // Construir respuesta priorizando orden BLOCK_ORDER
      const seen = {};
      BLOCK_ORDER.forEach(block => {
        if (accumulator[block]) {
          const a = accumulator[block];
          statsByBlock.push({
            block: block,
            totalRespuestas: a.total,
            correctas: a.correctas,
            porcentaje: a.total > 0 ? parseFloat(((a.correctas / a.total) * 100).toFixed(1)) : 0
          });
          seen[block] = true;
        }
      });
      Object.keys(accumulator).forEach(block => {
        if (seen[block]) return;
        const a = accumulator[block];
        statsByBlock.push({
          block: block,
          totalRespuestas: a.total,
          correctas: a.correctas,
          porcentaje: a.total > 0 ? parseFloat(((a.correctas / a.total) * 100).toFixed(1)) : 0
        });
      });
    }

    return {
      history: history,
      statsByBlock: statsByBlock
    };
  }

  // ============================================
  // ESTADÍSTICAS POR PREGUNTA
  // ============================================

  /**
  * Agrega estadísticas de una pregunta desde respuestas_log
  * @returns {object} { totalRespuestas, pctOption: [n1..n5] }
  */
  function getQuestionStats(questionId) {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const logSheet = ss.getSheetByName('respuestas_log');

    if (!logSheet) {
      return { totalRespuestas: 0, pctOption: [0, 0, 0, 0, 0] };
    }

    const data = logSheet.getDataRange().getValues();
    if (data.length <= 1) {
      return { totalRespuestas: 0, pctOption: [0, 0, 0, 0, 0] };
    }

    const counts = [0, 0, 0, 0, 0];
    let total = 0;
    let correctas = 0;

    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      const qid = String(row[2] || '').trim();
      if (qid !== String(questionId).trim()) continue;

      const elegida = parseInt(row[6]);
      if (!isNaN(elegida) && elegida >= 1 && elegida <= 5) {
        counts[elegida - 1]++;
      }
      total++;

      const correcta = row[5] === true || String(row[5]).toUpperCase() === 'TRUE';
      if (correcta) correctas++;
    }

    const pctOption = counts.map(c => total > 0 ? parseFloat(((c / total) * 100).toFixed(1)) : 0);

    return {
      questionId: questionId,
      totalRespuestas: total,
      correctas: correctas,
      porcentajeAcierto: total > 0 ? parseFloat(((correctas / total) * 100).toFixed(1)) : 0,
      countsOption: counts,
      pctOption: pctOption
    };
  }

  // ============================================
  // FUNCIONES DE PRUEBA
  // ============================================

  function testGetConfig() {
    const config = getConfig();
    console.log(JSON.stringify(config, null, 2));
  }

  function testGetQuestions() {
    const questions = getQuestions();
    console.log(`Total preguntas: ${questions.length}`);
    console.log(JSON.stringify(questions.slice(0, 2), null, 2));
  }

  function testDoGet() {
    const configResult = doGet({ parameter: { action: 'config' } });
    console.log('Config:', configResult.getContent());

    const questionsResult = doGet({ parameter: { action: 'questions' } });
    console.log('Questions:', questionsResult.getContent());
  }

  function testCheckAccess() {
    const result = checkUserAccess('12345678', 'test@example.com');
    console.log(JSON.stringify(result, null, 2));
  }

  // ============================================
  // SETUP AUTOMÁTICO DE HOJAS
  // ============================================
  /**
   * Crea (si no existen) las 12 hojas necesarias para SimulaENCAPS, con
   * sus encabezados, formato base y, en el caso de Estructura_ENCAPS,
   * con sub-áreas sugeridas precargadas (suman 100 preguntas).
   *
   * Ejecutar UNA SOLA VEZ desde el editor de Apps Script:
   *   1. Abre el proyecto en script.google.com
   *   2. Selecciona la función `setupSheets` en el desplegable superior
   *   3. Click en "Ejecutar" (te pedirá autorización la primera vez)
   *   4. Verifica en tu spreadsheet que las 12 hojas estén creadas
   *
   * Es seguro re-ejecutarla: si una hoja ya existe, no la sobrescribe.
   */
  function setupSheets() {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const report = [];

    // -------- Definición declarativa de todas las hojas --------
    const SHEET_DEFS = [
      // 5 BANCOS DE PREGUNTAS
      {
        name: 'Banco_SaludPublica',
        headers: ['Question Text','Question Type','Option 1','Option 2','Option 3','Option 4','Option 5','Correct Answer','Time in seconds','Image Link','NUMERO','SUB-AREA','TEMA','SUBTEMA','NOMBRE DEL ARCHIVO','JUSTIFICACION','NIVEL','REFERENCIA NORMATIVA'],
        widths: [400,120,200,200,200,200,200,80,80,200,60,150,200,200,200,400,100,200]
      },
      {
        name: 'Banco_AtencionIntegral',
        headers: ['Question Text','Question Type','Option 1','Option 2','Option 3','Option 4','Option 5','Correct Answer','Time in seconds','Image Link','NUMERO','SUB-AREA','TEMA','SUBTEMA','NOMBRE DEL ARCHIVO','JUSTIFICACION','NIVEL','REFERENCIA NORMATIVA'],
        widths: [400,120,200,200,200,200,200,80,80,200,60,150,200,200,200,400,100,200]
      },
      {
        name: 'Banco_Etica',
        headers: ['Question Text','Question Type','Option 1','Option 2','Option 3','Option 4','Option 5','Correct Answer','Time in seconds','Image Link','NUMERO','SUB-AREA','TEMA','SUBTEMA','NOMBRE DEL ARCHIVO','JUSTIFICACION','NIVEL','REFERENCIA NORMATIVA'],
        widths: [400,120,200,200,200,200,200,80,80,200,60,150,200,200,200,400,100,200]
      },
      {
        name: 'Banco_Investigacion',
        headers: ['Question Text','Question Type','Option 1','Option 2','Option 3','Option 4','Option 5','Correct Answer','Time in seconds','Image Link','NUMERO','SUB-AREA','TEMA','SUBTEMA','NOMBRE DEL ARCHIVO','JUSTIFICACION','NIVEL','REFERENCIA NORMATIVA'],
        widths: [400,120,200,200,200,200,200,80,80,200,60,150,200,200,200,400,100,200]
      },
      {
        name: 'Banco_Administracion',
        headers: ['Question Text','Question Type','Option 1','Option 2','Option 3','Option 4','Option 5','Correct Answer','Time in seconds','Image Link','NUMERO','SUB-AREA','TEMA','SUBTEMA','NOMBRE DEL ARCHIVO','JUSTIFICACION','NIVEL','REFERENCIA NORMATIVA'],
        widths: [400,120,200,200,200,200,200,80,80,200,60,150,200,200,200,400,100,200]
      },

      // ESTRUCTURA DEL EXAMEN (con datos sugeridos precargados)
      {
        name: 'Estructura_ENCAPS',
        headers: ['BLOQUE','SUB-AREA','TEMA','NUM_PREGUNTAS','PUNTAJE_EST'],
        widths: [200,200,400,140,140],
        seed: [
          // Salud Pública (20)
          ['Salud Pública','Epidemiología','Indicadores de morbi-mortalidad, vigilancia epidemiológica',6,6],
          ['Salud Pública','Promoción de la salud','Determinantes sociales, estilos de vida saludables',5,5],
          ['Salud Pública','Prevención de enfermedades','Inmunizaciones, ESNI, control de daños no transmisibles',5,5],
          ['Salud Pública','Salud ambiental','Saneamiento, calidad del agua, residuos sólidos',4,4],
          // Atención Integral (25)
          ['Atención Integral','AIEPI','Atención integrada al niño y adolescente, signos de alarma',8,8],
          ['Atención Integral','Salud materna','Control prenatal, parto, puerperio, planificación familiar',7,7],
          ['Atención Integral','Salud mental','Tamizaje de depresión y ansiedad en APS, violencia familiar',5,5],
          ['Atención Integral','Etapas de vida','Adulto, adulto mayor, atención integral por etapa',5,5],
          // Ética (15)
          ['Ética','Bioética clínica','Principios, autonomía, consentimiento informado',5,5],
          ['Ética','Código deontológico','Código de Ética del Colegio Médico del Perú',5,5],
          ['Ética','Interculturalidad','Atención con pertinencia cultural, derechos del paciente',5,5],
          // Investigación (15)
          ['Investigación','Metodología','Tipos de estudio, diseño, hipótesis y variables',5,5],
          ['Investigación','Estadística','Pruebas, intervalos de confianza, p-valor',5,5],
          ['Investigación','Lectura crítica','Validez interna/externa, sesgos, MBE',5,5],
          // Administración (25)
          ['Administración','Gestión de servicios','Cartera de servicios, microrredes, niveles de atención',7,7],
          ['Administración','Normativa MINSA','NTS y RM vigentes para APS, organización del sector',7,7],
          ['Administración','Planificación','Plan operativo, plan estratégico institucional',6,6],
          ['Administración','Aseguramiento','SIS, AUS, financiamiento de la salud',5,5]
        ]
      },

      // FLASHCARDS
      {
        name: 'flashcards',
        headers: ['ID','Bloque','SubArea','Tema','Frente','Reverso','Referencia'],
        widths: [80,200,200,200,400,400,250]
      },

      // TESTIMONIOS (vacía hasta tener reales)
      {
        name: 'testimonios',
        headers: ['Fecha','Nombre','Establecimiento','Region','Texto','Aprobado'],
        widths: [150,200,250,150,500,100]
      },

      // USUARIOS (campos ENCAPS)
      {
        name: 'usuarios',
        headers: ['Fecha','DNI','Nombre','Email','Celular','Establecimiento','Region','Cargo'],
        widths: [150,100,250,220,120,300,150,200]
      },

      // HISTORIAL DE PUNTAJES (con NENC, PPP, PF)
      {
        name: 'historial_puntajes',
        headers: ['DNI','Fecha','Correctas','Total','Puntaje','NENC','PPP','PF','Porcentaje'],
        widths: [100,150,100,80,100,100,100,100,100]
      },

      // CONFIRMADO (usuarios con acceso ilimitado)
      {
        name: 'confirmado',
        headers: ['DNI','Nombre','Email'],
        widths: [100,250,220]
      },

      // RESPUESTAS LOG (analytics, repaso de incorrectas, comparación)
      {
        name: 'respuestas_log',
        headers: ['DNI','Fecha','QuestionID','Bloque','SubArea','Correcta','RespuestaElegida'],
        widths: [100,150,250,200,200,100,140]
      }
    ];

    // -------- Crear cada hoja si no existe --------
    SHEET_DEFS.forEach(function(def) {
      let sheet = ss.getSheetByName(def.name);
      const justCreated = !sheet;

      if (!sheet) {
        sheet = ss.insertSheet(def.name);
      }

      // Si la hoja está completamente vacía (sin encabezados), poblamos
      const lastCol = sheet.getLastColumn();
      const lastRow = sheet.getLastRow();
      const isEmpty = lastCol === 0 && lastRow === 0;

      if (justCreated || isEmpty) {
        // Encabezados
        sheet.getRange(1, 1, 1, def.headers.length).setValues([def.headers]);

        // Formato del header: bold, fondo navy, texto blanco
        const headerRange = sheet.getRange(1, 1, 1, def.headers.length);
        headerRange.setFontWeight('bold');
        headerRange.setBackground('#16264D');
        headerRange.setFontColor('#FFFFFF');
        headerRange.setHorizontalAlignment('center');
        headerRange.setVerticalAlignment('middle');

        // Anchos de columna
        if (def.widths && def.widths.length === def.headers.length) {
          for (let i = 0; i < def.widths.length; i++) {
            sheet.setColumnWidth(i + 1, def.widths[i]);
          }
        }

        // Congelar primera fila
        sheet.setFrozenRows(1);

        // Seed data si existe
        if (def.seed && def.seed.length > 0) {
          sheet.getRange(2, 1, def.seed.length, def.seed[0].length).setValues(def.seed);
        }

        report.push('✓ ' + def.name + (justCreated ? ' (creada)' : ' (poblada)') + (def.seed ? ' con ' + def.seed.length + ' filas' : ''));
      } else {
        report.push('• ' + def.name + ' ya existía — no se modificó');
      }
    });

    // -------- Eliminar la hoja por defecto "Sheet1" / "Hoja 1" si quedó vacía --------
    const defaultNames = ['Sheet1', 'Hoja 1', 'Hoja1'];
    defaultNames.forEach(function(n) {
      const s = ss.getSheetByName(n);
      if (s && s.getLastRow() === 0 && s.getLastColumn() === 0 && ss.getSheets().length > 1) {
        ss.deleteSheet(s);
        report.push('✗ Hoja por defecto "' + n + '" eliminada');
      }
    });

    const summary = '=== SETUP COMPLETADO ===\n' + report.join('\n') +
      '\n\nTotal hojas en spreadsheet: ' + ss.getSheets().length +
      '\n\nSiguiente paso: cargar tus preguntas en los 5 bancos Banco_*';

    console.log(summary);
    return summary;
  }

  /**
   * Función auxiliar: si quieres reiniciar TODO (PELIGROSO — borra todas las hojas
   * de SimulaENCAPS y vuelve a crearlas vacías). Descomentar manualmente para usar.
   */
  // function resetAndSetup() {
  //   const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  //   const sheetNames = [
  //     'Banco_SaludPublica','Banco_AtencionIntegral','Banco_Etica',
  //     'Banco_Investigacion','Banco_Administracion','Estructura_ENCAPS',
  //     'flashcards','testimonios','usuarios','historial_puntajes',
  //     'confirmado','respuestas_log'
  //   ];
  //   sheetNames.forEach(function(n) {
  //     const s = ss.getSheetByName(n);
  //     if (s) ss.deleteSheet(s);
  //   });
  //   return setupSheets();
  // }
