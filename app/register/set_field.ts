const numerical = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0']
export async function setCpf2(cpf: string, func: (arg0: string) => void) {
  let enter_cpf = ''
  for (let i = 0; i < cpf.length; i++){
    const char = cpf[i]
    if (!numerical.includes(char)) {
      continue
    }
    else if (enter_cpf.length >= 14) {
      enter_cpf = enter_cpf.substring(0, 14)
      break
    }
    else if (enter_cpf.length === 3 || enter_cpf.length === 7 || enter_cpf.length === 11) {
      var diff = ['.']
      if (enter_cpf.length === 11) {
        diff = ['-']
      }
      enter_cpf = enter_cpf.substring(0, enter_cpf.length) + diff + [char]
    }
    else {
      enter_cpf = enter_cpf.substring(0, enter_cpf.length) + [char]
    }
  }

  func(enter_cpf)
}

export async function setCep2(cep: string, func: (arg0: string) => void) {
  let enter_cep = ''
  for (let i = 0; i < cep.length; i++) {
    const char = cep[i]
    if (!numerical.includes(char)) {
      continue
    }
    else if (enter_cep.length > 9) {
      enter_cep = enter_cep.substring(0, 9)
      break
    }
    else if (enter_cep.length === 5) {
      var diff = ['-']
      enter_cep = enter_cep + diff + [char]
    }
    else {
      enter_cep = enter_cep + [char]
    }
  }
  
  func(enter_cep)
}

export async function setPhone2(phone: string, func: (arg0: string) => void) {
  let enter_phone = ''
  for (let i = 0; i < phone.length; i++) {
    const char = phone[i]
    if (!numerical.includes(char)) {
      continue
    }
    else if (enter_phone.length > 25) {
      enter_phone = enter_phone.substring(0, 25)
      break
    }
    else {
      enter_phone = enter_phone + [char]
    }
  }
  func(enter_phone)
}