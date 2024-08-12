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
  const last = cep[cep.length - 1]
  if (!numerical.includes(last) || cep.length > 14) {
    cep = cep.substring(0, cep.length-1)
  }
  if (cep.length === 6) {
    var diff = ['-']
    cep = cep.substring(0, cep.length-1) + diff + [last]
  }
  func(cep)
}


export async function setPhone2(phone: string, func: (arg0: string) => void) {
  const last = phone[phone.length - 1]
  if (!numerical.includes(last) || phone.length > 17) {
    phone = phone.substring(0, phone.length-1)
  }
  func(phone)
}